import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

// Màn hình nhập mã PIN. Server so khớp PIN (ADMIN_PIN) rồi mới cấp phiên.
export default function PinGate({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!pin || busy) return;
    setBusy(true);
    setError('');
    try {
      const { token } = await adminApi.login(pin);
      onSuccess(token);
    } catch (err) {
      setPin('');
      if (err.name === 'ApiError') setError(err.message);
      else setError('Không kết nối được tới máy chủ. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border bg-surface p-8 shadow-card"
        autoComplete="off"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-center text-2xl">Khu vực quản trị</h1>
        <p className="mt-2 text-center text-sm text-muted">Nhập mã PIN để tiếp tục.</p>

        <label htmlFor="admin-pin" className="mt-7 block text-sm font-semibold">
          Mã PIN
        </label>
        <div className="relative mt-2">
          <input
            id="admin-pin"
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            maxLength={100}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'admin-pin-error' : undefined}
            className="w-full rounded-xl border bg-bg py-3 pl-4 pr-12 text-center text-lg tracking-[0.4em] text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? 'Ẩn mã PIN' : 'Hiện mã PIN'}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {error && (
          <p id="admin-pin-error" role="alert" className="mt-3 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button type="submit" disabled={!pin || busy} className="btn btn-primary mt-6 w-full disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Đăng nhập
        </button>
      </form>
    </main>
  );
}
