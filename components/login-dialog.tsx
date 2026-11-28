'use client';
// 로그인 창(2026-11-28 사용자 요청): 보기는 누구나, 기록을 고치려 하면 이 창이 뜬다. 로그인하면 하려던 변경을 이어서 한다.
// 내 상태·인물 서랍(Radix 시트) 위에서도 열리므로 같은 Radix Dialog로 만들어 초점·누르기 순서를 맞춘다.
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { LockKeyhole } from 'lucide-react';
import { useLoginDialog } from './checks';
import { Button } from './ui/button';

export function LoginDialog() {
  const login = useLoginDialog(), [user, setUser] = useState(''), [pass, setPass] = useState('');
  return <Dialog.Root open={login.open} onOpenChange={open => { if (!open && !login.busy) { setPass(''); login.close(); } }}>
    <Dialog.Portal>
      <Dialog.Overlay className="login-overlay" />
      <Dialog.Content className="login-box" aria-describedby="login-desc">
        <LockKeyhole size={36} aria-hidden="true" />
        <Dialog.Title className="login-title">로그인</Dialog.Title>
        <p id="login-desc" className="muted">보기는 누구나 할 수 있습니다. 기록을 고치려면 로그인하세요.</p>
        <form className="login-form" onSubmit={e => { e.preventDefault(); void login.submit(user.trim(), pass).then(() => setPass('')); }}>
          <label><span>아이디</span><input name="username" autoComplete="username" value={user} onChange={e => setUser(e.target.value)} required autoFocus /></label>
          <label><span>비밀번호</span><input name="password" type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} required /></label>
          {login.error && <p role="alert" className="login-error">{login.error}</p>}
          <div className="login-actions">
            <Button type="button" variant="secondary" disabled={login.busy} onClick={() => { setPass(''); login.close(); }}>취소</Button>
            <Button type="submit" disabled={login.busy}>{login.busy ? '확인하는 중' : '로그인'}</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
