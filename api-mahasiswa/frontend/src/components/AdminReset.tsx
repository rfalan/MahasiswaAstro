import { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import '../styles/auth.css';
import '../styles/admin-reset.css';
import '../styles/password-toggle.css';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminReset() {
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
      const parent = input.parentElement;
      if (!parent || parent.querySelector('.password-toggle')) return;
      parent.classList.add('password-input-wrap');
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'password-toggle'; toggle.setAttribute('aria-label', 'Tampilkan password');
      const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
      toggle.innerHTML = eye;
      toggle.addEventListener('click', () => { const visible = input.type === 'text'; input.type = visible ? 'password' : 'text'; toggle.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password'); });
      parent.appendChild(toggle);
    });
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const response = await fetch(`${API_URL}/reset-admin-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const responseText = await response.text();
      let payload: { message?: string; error?: string } = {};
      try { payload = JSON.parse(responseText); } catch { throw new Error(responseText || 'Server mengembalikan respons yang tidak valid'); }
      if (!response.ok) throw new Error(payload.error || 'Password gagal direset');
      setMessage(payload.message); setForm({ email: form.email, password: '', confirm_password: '' });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Password gagal direset'); }
    finally { setSaving(false); }
  };

  return <main className="reset-shell"><div className="reset-card"><div className="login-brand"><span className="brand-mark">M</span><span>mhs<span className="brand-dot">.</span></span></div><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Reset password admin</h1><p className="reset-subtitle">Masukkan email admin yang terdaftar, lalu buat password baru.</p><form onSubmit={submit}><label>Email admin<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@kampus.local" /></label><label>Password baru<input type="password" required minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Minimal 6 karakter" /></label><label>Konfirmasi password<input type="password" required minLength={6} value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} /></label>{error && <div className="login-error">{error}</div>}{message && <div className="reset-success">{message}</div>}<button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Reset password'}</button></form><a className="back-login" href="/">Kembali ke login</a><p className="reset-warning">Untuk keamanan produksi, tambahkan verifikasi email atau OTP.</p></div></main>;
  }
