import { useState } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
type Props = { token: string; onSubmitted: () => void };

export default function StudentInternshipForm({ token, onSubmitted }: Props) {
  const [form, setForm] = useState({ perusahaan: '', posisi: '', catatan: '' });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/me/magang`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Pengajuan gagal');
      setForm({ perusahaan: '', posisi: '', catatan: '' }); setOpen(false); onSubmitted();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pengajuan gagal'); }
    finally { setSaving(false); }
  };
  return <div className="student-apply"><div><p className="eyebrow">START YOUR INTERNSHIP</p><h2>Ajukan magang</h2><p>Isi rencana magang Anda. Admin akan melakukan screening dan mengaktifkan prosesnya.</p></div><button className="primary-button" onClick={() => { setOpen(!open); setError(''); }}>{open ? 'Tutup form' : '+ Ajukan sekarang'}</button>{open && <form className="student-apply-form" onSubmit={submit}><label>Perusahaan<input required value={form.perusahaan} onChange={(event) => setForm({ ...form, perusahaan: event.target.value })} placeholder="Nama perusahaan" /></label><label>Posisi / divisi<input required value={form.posisi} onChange={(event) => setForm({ ...form, posisi: event.target.value })} placeholder="Contoh: UI/UX Intern" /></label><label>Catatan<textarea value={form.catatan} onChange={(event) => setForm({ ...form, catatan: event.target.value })} placeholder="Informasi tambahan untuk admin" /></label>{error && <div className="internship-error">{error}</div>}<button className="primaryq
-button" disabled={saving}>{saving ? 'Mengirim...' : 'Kirim pengajuan'}</button></form>}</div>;
}
