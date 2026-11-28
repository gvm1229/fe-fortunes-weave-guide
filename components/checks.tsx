'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { validateChecks, validateStatus, sanitizeStatus, sanitizeBuilds, nextBuilds, type CheckState, type Status, type Build, type BuildRoute } from '@/lib/check-state';
import { limits, effectiveChecks, emptyStatus } from '@/lib/status';
/**
 * 진행 기록(체크·내 상태·인물 육성 기록)은 서버 데이터베이스에 있다(2026-11-28 사용자 요청: 기기마다 JSON을 옮기지 않게).
 * 보기는 누구나 한다. 고치기는 로그인했을 때만 하고, 로그인 전에 고치려 하면 로그인 창을 띄운 뒤 로그인하면 그 변경을 이어서 한다.
 * 브라우저 저장소는 마지막으로 받은 기록의 사본(서버에 닿지 않을 때 보기용)으로만 쓴다.
 * 기록 API가 아예 없는 곳(개발 서버·검사용 정적 서버: /api가 404)에서는 예전처럼 이 브라우저 저장소에만 쓰는 '로컬' 방식으로 돈다.
 */
const cacheKey = 'fortunes-weave-server-copy-v1';
/** 로컬 방식의 열쇠(예전 그대로). 육성 기록(U72)은 다른 열쇠에 둔다(Fable 검토 21 지적 4). */
const localKey = 'fortunes-weave-checklist-v1', localBuildsKey = 'fortunes-weave-builds-v1';
const empty: CheckState = { schemaVersion: 1, revision: 0, checks: {} };
type Snap = { data: CheckState; ready: boolean; status: string; error: boolean; loggedIn: boolean; online: boolean; local: boolean };
const initial: Snap = { data: empty, ready: false, status: '기록을 불러오는 중입니다.', error: false, loggedIn: false, online: false, local: false };
let snapshot = initial;
const listeners = new Set<() => void>();
const set = (patch: Partial<Snap>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(fn => fn()); };
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

/** 서버 값은 느슨하게 읽는다(모르는 축복은 버림. 육성 기록은 모양만 고치고 모르는 인물·병종도 보관). 가져오기 파일만 엄격하게 검사한다. */
function readStored(value: unknown): CheckState { const d = validateChecks(value); return d.status ? { ...d, status: sanitizeStatus(d.status, limits) } : d; }
const writeCache = (data: CheckState) => { try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* 사본은 없어도 된다 */ } };

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(path, { ...init, credentials: 'same-origin', headers: { 'content-type': 'application/json', ...(init.method && init.method !== 'GET' ? { 'x-fefw': '1' } : {}), ...init.headers } });
  let body: { error?: string; [k: string]: unknown } = {};
  try { body = await res.json(); } catch { /* 본문 없음 */ }
  return { ok: res.ok, status: res.status, body };
}

function localLoad() {
  try {
    const raw = localStorage.getItem(localKey); const { builds: legacy, ...checksData } = raw === null ? empty : readStored(JSON.parse(raw));
    const rawBuilds = localStorage.getItem(localBuildsKey); let builds = rawBuilds === null ? undefined : sanitizeBuilds(JSON.parse(rawBuilds));
    if (rawBuilds === null && legacy) { builds = legacy; localStorage.setItem(localBuildsKey, JSON.stringify(legacy)); }
    if (raw === null || legacy) localStorage.setItem(localKey, JSON.stringify(checksData));
    set({ data: { ...checksData, ...(builds && Object.keys(builds).length ? { builds } : {}) }, ready: true, local: true, online: false, error: false, status: '이 브라우저의 체크 기록을 불러왔습니다.' });
  } catch { set({ ready: false, local: true, error: true, status: '기록을 읽거나 저장할 수 없습니다. JSON으로 백업하고 브라우저 저장 설정을 확인하세요. 기존 기록은 덮어쓰지 않았습니다.' }); }
}
/** 로컬 방식 저장. 육성 기록 열쇠를 먼저 쓰고, 실패하면 체크 열쇠도 쓰지 않는다(Fable 재검토 E). */
function localSave(data: CheckState): boolean {
  try {
    const { builds, ...checksData } = data, before = localStorage.getItem(localBuildsKey);
    localStorage.setItem(localBuildsKey, JSON.stringify(builds && Object.keys(builds).length ? builds : {}));
    try { localStorage.setItem(localKey, JSON.stringify(checksData)); } catch (e) { try { if (before === null) localStorage.removeItem(localBuildsKey); else localStorage.setItem(localBuildsKey, before); } catch { /* 되돌리기도 실패하면 그대로 둔다 */ } throw e; }
    set({ data, error: false, status: '체크를 이 브라우저에 저장했습니다.' }); return true;
  } catch { set({ error: true, status: '저장하지 못했습니다. 체크는 바뀌지 않았습니다. 저장 공간을 확인한 뒤 다시 시도하세요.' }); return false; }
}

let loading: Promise<void> | undefined;
function load(force = false) {
  if (snapshot.ready && !force) return;
  if (loading && !force) return;
  if (!snapshot.ready) { try { const raw = localStorage.getItem(cacheKey); if (raw) set({ data: readStored(JSON.parse(raw)), ready: true, status: '저장된 사본을 보여 줍니다. 서버 기록을 확인하는 중입니다.' }); } catch { /* 사본이 깨졌으면 무시 */ } }
  loading = (async () => {
    try {
      const [p, s] = await Promise.all([api('/api/progress'), api('/api/session')]);
      if (p.status === 404) { localLoad(); return; }
      if (!p.ok) throw new Error(p.body.error || `서버 응답 ${p.status}`);
      const data = p.body.data ? readStored(p.body.data) : empty;
      writeCache(data);
      set({ data: { ...data, revision: p.body.revision as number }, ready: true, online: true, loggedIn: !!s.body.loggedIn, error: false, status: '서버의 기록을 불러왔습니다.' });
    } catch {
      set({ ready: true, online: false, error: true, status: '기록 서버에 연결하지 못했습니다. 지금은 보기만 됩니다.' });
    } finally { loading = undefined; }
  })();
}

/** 로그인 창(components/login-dialog.tsx)이 보는 상태. 로그인하면 기다리던 변경을 이어서 한다. */
type LoginState = { open: boolean; error: string; busy: boolean };
let loginState: LoginState = { open: false, error: '', busy: false };
let pending: { run: () => void; cancel?: () => void } | undefined;
const loginListeners = new Set<() => void>();
const setLogin = (patch: Partial<LoginState>) => { loginState = { ...loginState, ...patch }; loginListeners.forEach(fn => fn()); };
export function useLoginDialog() {
  const state = useSyncExternalStore(fn => { loginListeners.add(fn); return () => { loginListeners.delete(fn); }; }, () => loginState, () => loginState);
  return {
    ...state,
    close: () => { const p = pending; pending = undefined; setLogin({ open: false, error: '', busy: false }); p?.cancel?.(); },
    submit: async (username: string, password: string) => {
      setLogin({ busy: true, error: '' });
      try {
        const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
        if (!r.ok) { setLogin({ busy: false, error: r.body.error || '로그인하지 못했습니다.' }); return; }
        set({ loggedIn: true });
        setLogin({ open: false, busy: false, error: '' });
        const next = pending; pending = undefined; next?.run();
      } catch { setLogin({ busy: false, error: '기록 서버에 연결하지 못했습니다.' }); }
    },
  };
}
export function requestLogin(run?: () => void, cancel?: () => void) { pending?.cancel?.(); pending = run ? { run, cancel } : undefined; setLogin({ open: true, error: '' }); }
export async function logout() { try { await api('/api/logout', { method: 'POST' }); } finally { set({ loggedIn: false, status: '로그아웃했습니다. 보기만 됩니다.' }); } }

/** 변경을 서버에 보낸다. 화면은 먼저 바꾸고, 서버가 거절하면 되돌린다. 보내기는 하나씩 차례로 해서 revision이 꼬이지 않게 한다. */
let queue: Promise<unknown> = Promise.resolve();
function commit(make: (d: CheckState) => CheckState, done?: (ok: boolean, message?: string) => void): void {
  if (!snapshot.ready) { done?.(false, '기록을 아직 불러오지 못했습니다.'); return; }
  if (snapshot.local) { const ok = localSave({ ...make(snapshot.data), revision: snapshot.data.revision + 1, updatedAt: new Date().toISOString() }); done?.(ok, ok ? undefined : '이 브라우저에 저장하지 못했습니다. 저장 공간이나 사생활 보호 모드를 확인하세요.'); return; }
  if (!snapshot.online) { done?.(false, '기록 서버에 연결하지 못해 고칠 수 없습니다.'); set({ error: true, status: '기록 서버에 연결하지 못해 고칠 수 없습니다. 다시 읽기를 눌러 보세요.' }); return; }
  if (!snapshot.loggedIn) { requestLogin(() => commit(make, done), () => done?.(false, '로그인하지 않아 저장하지 않았습니다.')); return; }
  const before = snapshot.data, next = { ...make(before), revision: before.revision + 1, updatedAt: new Date().toISOString() };
  set({ data: next, error: false, status: '저장하는 중입니다.' });
  queue = queue.then(async () => {
    try {
      const r = await api('/api/progress', { method: 'PUT', body: JSON.stringify({ baseRevision: next.revision - 1, data: next }) });
      if (r.ok) { writeCache(snapshot.data); set({ status: '서버에 저장했습니다.' }); done?.(true); return; }
      if (r.status === 401) { set({ data: before, loggedIn: false }); requestLogin(() => commit(make, done), () => done?.(false, '로그인하지 않아 저장하지 않았습니다.')); return; }
      if (r.status === 409) { set({ error: true, status: '다른 기기에서 기록이 바뀌어 새 기록을 불러왔습니다. 방금 고친 것은 저장되지 않았으니 다시 해 주세요.' }); load(true); done?.(false, '다른 기기에서 기록이 바뀌었습니다. 새 기록을 불러왔으니 다시 시도하세요.'); return; }
      set({ data: before, error: true, status: `저장하지 못했습니다(${r.body.error || r.status}). 바뀌지 않았습니다.` }); done?.(false, r.body.error);
    } catch {
      set({ data: before, error: true, status: '기록 서버에 연결하지 못해 저장하지 못했습니다. 바뀌지 않았습니다.' }); done?.(false, '기록 서버에 연결하지 못했습니다.');
    }
  });
}

export function useChecks() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  useEffect(() => {
    load();
    const sync = (e: StorageEvent) => { if (snapshot.local && (e.key === localKey || e.key === localBuildsKey)) localLoad(); };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, []);
  // effective: 저장된 체크 + 내 상태의 축복 단계로 끝난 구매 체크(2026-11-15). 화면의 완료·진행률·날짜는 이것을 쓴다.
  return {
    ...state, effective: effectiveChecks(state.data.checks, state.data.status),
    setStatus: (patch: Partial<Status>) => commit(d => ({ ...d, status: validateStatus({ ...emptyStatus, ...d.status, ...patch }, limits) })),
    toggle: (id: string, value: boolean) => commit(d => ({ ...d, checks: { ...d.checks, [id]: value } })),
    /** 파일을 검사해 서버에 저장한다. 파일의 육성 기록을 썼으면 true(알림 문구용). 로그인 전이면 로그인 뒤 이어서 저장한다. */
    importData: (value: unknown): Promise<boolean> => {
      const data = validateChecks(value, limits, true);
      return new Promise((ok, fail) => commit(d => ({
        ...data,
        // 내 상태가 없는 예전 파일은 지금의 내 상태를 지우지 않는다. 육성 기록이 없는(또는 빈) 파일도 지금 육성 기록을 지우지 않는다(2026-11-27 U72).
        ...(!data.status && d.status ? { status: d.status } : {}),
        ...(!data.builds && d.builds ? { builds: d.builds } : {}),
      }), (saved, message) => saved ? ok(!!data.builds) : fail(new Error(message || '저장하지 못했습니다.'))));
    },
    retry: () => load(true),
    /** 기록 지우기는 체크와 내 상태만 지우고 인물 육성 기록은 남긴다(2026-11-27 U72). */
    clear: () => commit(d => ({ ...empty, ...(d.builds ? { builds: d.builds } : {}) })),
    /** 인물 육성 기록 한 사람 고치기. patch가 null이면 그 사람 기록을 지운다. */
    setBuild: (route: BuildRoute, slug: string, patch: Partial<Build> | null) => commit(d => { const { builds: old, ...rest } = d; const builds = nextBuilds(old, route, slug, patch); return { ...rest, ...(builds ? { builds } : {}) }; }),
    login: () => requestLogin(),
    logout,
  };
}
