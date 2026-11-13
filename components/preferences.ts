'use client';
import { useEffect, useSyncExternalStore } from 'react';

type Value = string | boolean | string[] | number;
const key = 'fortunes-weave-view-v1';
const empty: Record<string, Value> = {};
let values = empty;
let loaded = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function usePreference<T extends Value>(name: string, fallback: T): [T, (value: T) => void] {
  const state = useSyncExternalStore(subscribe, () => values, () => empty);
  useEffect(() => {
    if (loaded) return;
    loaded = true;
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) values = Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) || (Array.isArray(value) && value.every(v => typeof v === 'string'))));
    } catch { /* 표시 설정 실패는 체크 기록에 영향을 주지 않는다. */ }
    listeners.forEach(listener => listener());
  }, []);
  const saved = state[name];
  const value = (Array.isArray(fallback) ? Array.isArray(saved) : typeof saved === typeof fallback) ? saved as T : fallback;
  return [value, next => {
    values = { ...values, [name]: next };
    try { localStorage.setItem(key, JSON.stringify(values)); } catch { /* 저장이 막혀도 현재 화면의 조작은 유지한다. */ }
    listeners.forEach(listener => listener());
  }];
}

export function useReadingMemory(scope: string) {
  useEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;
    const storageKey = 'fortunes-weave-disclosures:' + scope;
    let saved: Record<string, boolean> = {};
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (value && typeof value === 'object' && !Array.isArray(value)) saved = Object.fromEntries(Object.entries(value).filter(([,v]) => typeof v === 'boolean')) as Record<string,boolean>;
    } catch { /* 접기 상태와 실제 체크 기록은 별개다. */ }
    const identity = (detail: HTMLDetailsElement) => {
      const owner = detail.closest('.person,[data-source-block],.team-unit') || root;
      return (owner.getAttribute('data-source-block') || owner.querySelector('h2')?.textContent || '') + ':' + [...owner.querySelectorAll('details')].indexOf(detail);
    };
    for (const detail of root.querySelectorAll<HTMLDetailsElement>('details:not(.chapter-section)')) if (Object.hasOwn(saved, identity(detail))) detail.open = saved[identity(detail)];
    const remember = (event: Event) => {
      const detail = event.target;
      if (!(detail instanceof HTMLDetailsElement) || detail.classList.contains('chapter-section')) return;
      saved[identity(detail)] = detail.open;
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* 현재 화면의 접기는 유지한다. */ }
    };
    root.addEventListener('toggle', remember, true);
    return () => root.removeEventListener('toggle', remember, true);
  }, [scope]);
}
