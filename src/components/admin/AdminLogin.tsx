'use client';

import { useActionState } from 'react';
import { adminLogin, type LoginState } from '@/app/admin/actions';
import { Brand } from '@/components/Brand';

const initialState: LoginState = {};

export function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, initialState);

  return (
    <form
      action={action}
      className="w-full rounded-3xl border border-line bg-cream/40 p-7"
    >
      <Brand surface="paper" />
      <h1 className="mt-6 text-lg font-bold text-ink">ورود مدیریت</h1>
      <p className="mt-1 text-sm leading-7 text-muted">
        برای مشاهده‌ی نتایج نظرسنجی، رمز عبور را وارد کنید.
      </p>

      <label htmlFor="password" className="mt-6 block text-sm text-muted">
        رمز عبور
      </label>
      <input
        id="password"
        name="password"
        type="password"
        dir="ltr"
        autoFocus
        autoComplete="current-password"
        // text-base (16px), explicit: keeps iOS Safari from zooming in on focus.
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-paper px-3 text-start text-base text-ink outline-none transition focus:border-brand"
      />

      {state.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-brand">
          رمز عبور نادرست است.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-12 w-full rounded-xl bg-brand font-bold text-cream transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? 'در حال ورود…' : 'ورود'}
      </button>
    </form>
  );
}
