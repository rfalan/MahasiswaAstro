import { useEffect, useMemo, useState } from 'react';
import '../styles/dashboard.css';
import '../styles/analytics.css';
import '../styles/chart.css';
import '../styles/auth.css';
import '../styles/auth-switch.css';
import '../styles/logout.css';
import '../styles/account-types.css';
import '../styles/student-portal.css';
import '../styles/password-reset.css';
import '../styles/student-internship.css';
import '../styles/student-internship-polish.css';
import '../styles/internship-status.css';
import '../styles/password-toggle.css';
import AdminSettings from './AdminSettings';
import StudentInternshipForm from './StudentInternshipForm';

type Student = { id: number; nama: string; nim: string; jurusan: string; email?: string };
type Internship = { id: number; perusahaan: string; posisi: string; status: string; catatan: string; dokumen_url: string };
type FormState = Omit<Student, 'id'>;

const emptyForm: FormState = { nama: '', nim: '', jurusan: '' };
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

function Icon({ name }: { name: 'grid' | 'users' | 'chart' | 'settings' | 'search' | 'plus' | 'edit' | 'trash' | 'close' | 'check' | 'logout' | 'key' | 'briefcase' }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 16 4-5 3 2 5-7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-2v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.55-1.03H7v-2h.85A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.38 6.5V6h2v.5a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03H21v2h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /><path d="M14 8l4 4-4 4M18 12H8" /></>,
    key: <><circle cx="8" cy="15" r="3" /><path d="m10.5 12.5 8-8M16 6l2 2M14 8l2 2" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function Dashboard() {
  const [token, setToken] = useState(() => typeof window === 'undefined' ? '' : localStorage.getItem('mhs_token') || '');
  const [role, setRole] = useState(() => typeof window === 'undefined' ? '' : localStorage.getItem('mhs_role') || '');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerType, setRegisterType] = useState<'admin' | 'mahasiswa'>('mahasiswa');
  const [loginForm, setLoginForm] = useState({ email: 'admin@kampus.local', password: 'admin123' });
  const [registerForm, setRegisterForm] = useState({ nim: '', nama: '', email: '', password: '', confirm_password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSaving, setLoginSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeNav, setActiveNav] = useState<'overview' | 'students' | 'analytics' | 'settings'>('overview');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [myProfile, setMyProfile] = useState<Student | null>(null);
  const [myInternships, setMyInternships] = useState<Internship[]>([]);
  const [resetStudent, setResetStudent] = useState<Student | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSaving, setResetSaving] = useState(false);

  const loadStudents = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/mahasiswa`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Gagal terhubung ke API');
      setStudents(await response.json());
    } catch { setError('Data belum dapat dimuat. Pastikan API Go berjalan di port 8080.'); }
    finally { setLoading(false); }
  };

  const loadMyProfile = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      setMyProfile(await response.json());
      const internshipResponse = await fetch(`${API_URL}/me/magang`, { headers: { Authorization: `Bearer ${token}` } });
      if (internshipResponse.ok) setMyInternships(await internshipResponse.json());
    } catch { setError('Profil mahasiswa belum dapat dimuat.'); }
    finally { setLoading(false); }
  };
  const reloadMyInternships = async () => {
    const response = await fetch(`${API_URL}/me/magang`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setMyInternships(await response.json());
  };

  useEffect(() => { if (token) { if (role === 'mahasiswa') loadMyProfile(); else loadStudents(); } else setLoading(false); }, [token, role]);
  useEffect(() => {
    document.querySelectorAll<HTMLFormElement>('.login-box form').forEach((form) => form.noValidate = true);
    if (authMode === 'login') {
      document.querySelectorAll<HTMLInputElement>('.login-box input[type="email"]').forEach((input) => { input.type = 'text'; });
    }
  }, [authMode]);
  useEffect(() => {
    document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
      const parent = input.parentElement;
      if (!parent || parent.querySelector('.password-toggle')) return;
      parent.classList.add('password-input-wrap');
      parent.querySelector(':scope > span')?.remove();
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'password-toggle';
      toggle.setAttribute('aria-label', 'Tampilkan password');
      const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
      const eyeOff = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8M6.7 6.7C3.9 8.4 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
      toggle.innerHTML = eye;
      toggle.addEventListener('click', () => {
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        toggle.innerHTML = visible ? eye : eyeOff;
        toggle.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password');
      });
      parent.appendChild(toggle);
    });
  }, [authMode, resetStudent, modalOpen]);
  useEffect(() => {
    const settingsButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.nav-item')).find((button) => button.textContent?.includes('Pengaturan'));
    if (!settingsButton) return;
    const openSettings = () => setActiveNav('settings');
    settingsButton.addEventListener('click', openSettings);
    return () => settingsButton.removeEventListener('click', openSettings);
  });
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 3000); return () => clearTimeout(timer); } }, [notice]);

  const filtered = useMemo(() => students.filter((student) =>
    `${student.nama} ${student.nim} ${student.jurusan}`.toLowerCase().includes(query.toLowerCase())), [students, query]);
  const departments = new Set(students.map((student) => student.jurusan)).size;
  const departmentStats = useMemo(() => Array.from(students.reduce((counts, student) => counts.set(student.jurusan, (counts.get(student.jurusan) || 0) + 1), new Map<string, number>()).entries()).sort((first, second) => second[1] - first[1]), [students]);
  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); setError(''); };
  const openEdit = (student: Student) => { setEditing(student); setForm({ nama: student.nama, nim: student.nim, jurusan: student.jurusan }); setModalOpen(true); setError(''); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/mahasiswa${editing ? `/${editing.id}` : ''}`, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || payload.error || 'Permintaan gagal');
      setModalOpen(false); setNotice(editing ? 'Data mahasiswa diperbarui' : 'Mahasiswa baru ditambahkan'); await loadStudents();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Terjadi kesalahan'); }
    finally { setSaving(false); }
  };

  const remove = async (student: Student) => {
    if (!window.confirm(`Hapus data ${student.nama}?`)) return;
    try { const response = await fetch(`${API_URL}/mahasiswa/${student.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error(); setNotice('Data mahasiswa dihapus'); await loadStudents(); }
    catch { setError('Data gagal dihapus.'); }
  };

  const resetStudentPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetStudent) return;
    setResetSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/mahasiswa/${resetStudent.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ password: resetPassword }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Password gagal direset');
      setResetStudent(null); setResetPassword(''); setNotice('Password mahasiswa berhasil direset');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Password gagal direset'); }
    finally { setResetSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('mhs_token');
    localStorage.removeItem('mhs_role');
    setRole('');
    setToken('');
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoginSaving(true); setLoginError('');
    try {
      const isRegistering = authMode === 'register';
      const studentRegistration = isRegistering && registerType === 'mahasiswa';
      const response = await fetch(`${API_URL}/${studentRegistration ? 'register-mahasiswa' : isRegistering ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isRegistering ? registerForm : { credential: loginForm.email, password: loginForm.password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Login gagal');
      if (isRegistering) { setAuthMode('login'); setLoginForm({ email: registerType === 'mahasiswa' ? registerForm.nim : registerForm.email, password: '' }); setLoginError('Registrasi berhasil. Silakan masuk dengan akun baru.'); } else { localStorage.setItem('mhs_token', payload.token); localStorage.setItem('mhs_role', payload.user.role); setRole(payload.user.role); setToken(payload.token); }
    } catch (cause) { setLoginError(cause instanceof Error ? cause.message : authMode === 'register' ? 'Registrasi gagal' : 'Login gagal'); }
    finally { setLoginSaving(false); }
  };

    if (!token) return <main className="login-shell"><div className="login-art"><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /><div className="login-brand"><span className="brand-mark">M</span><span>mhs<span className="brand-dot">.</span></span></div><div className="login-art-copy"><p>ACADEMIC WORKSPACE</p><h1>Data kampus,<br /><em>lebih terarah.</em></h1><span>Kelola informasi mahasiswa dalam satu ruang kerja yang tenang.</span></div></div><div className="login-panel"><div className="login-box"><p className="eyebrow">{authMode === 'register' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</p><h2>{authMode === 'register' ? 'Buat akun baru' : 'Masuk ke workspace'}</h2><p className="login-subtitle">{authMode === 'register' ? 'Pilih jenis akun yang ingin Anda daftarkan.' : 'Gunakan akun Anda untuk melanjutkan.'}</p><form onSubmit={login}>{authMode === 'register' && <><div className="account-types"><button type="button" className={registerType === 'mahasiswa' ? 'selected' : ''} onClick={() => setRegisterType('mahasiswa')}>Mahasiswa</button><button type="button" className={registerType === 'admin' ? 'selected' : ''} onClick={() => setRegisterType('admin')}>Admin</button></div>{registerType === 'mahasiswa' ? <label>NIM mahasiswa<input required value={registerForm.nim} onChange={(event) => setRegisterForm({ ...registerForm, nim: event.target.value })} placeholder="Contoh: 23010008" /></label> : <label>Nama lengkap<input required value={registerForm.nama} onChange={(event) => setRegisterForm({ ...registerForm, nama: event.target.value })} placeholder="Nama admin" /></label>}</>}<label>{authMode === 'login' ? 'NIM atau email' : 'Email'}<input type={authMode === 'login' ? 'text' : 'email'} required value={authMode === 'register' ? registerForm.email : loginForm.email} onChange={(event) => authMode === 'register' ? setRegisterForm({ ...registerForm, email: event.target.value }) : setLoginForm({ ...loginForm, email: event.target.value })} placeholder={authMode === 'login' ? 'Contoh: 23010009' : 'nama@email.com'} /></label><label>Password<div className="password-field"><input type="password" required minLength={6} value={authMode === 'register' ? registerForm.password : loginForm.password} onChange={(event) => authMode === 'register' ? setRegisterForm({ ...registerForm, password: event.target.value }) : setLoginForm({ ...loginForm, password: event.target.value })} /><span>•••</span></div></label>{authMode === 'register' && <label>Konfirmasi password<input type="password" required minLength={6} value={registerForm.confirm_password} onChange={(event) => setRegisterForm({ ...registerForm, confirm_password: event.target.value })} /></label>}{loginError && <div className="login-error">{loginError}</div>}<button className="login-button" disabled={loginSaving}>{loginSaving ? 'Memproses...' : authMode === 'register' ? `Daftar sebagai ${registerType}` : 'Masuk'}</button></form><button className="auth-switch" onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setLoginError(''); }}>{authMode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar sekarang'}</button>{authMode === 'login' && <p className="login-hint">Akun demo: admin@kampus.local / admin123</p>}</div><span className="login-footer">© 2026 mhs. Academic management platform.</span></div></main>;

    if (activeNav === 'settings') return <AdminSettings onBack={() => setActiveNav('overview')} onLogout={handleLogout} />;

  const goTo = (section: 'overview' | 'students' | 'analytics' | 'settings') => {
    setActiveNav(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    localStorage.removeItem('mhs_token');
    localStorage.removeItem('mhs_role');
    setRole('');
    setToken('');
  };

  if (role === 'mahasiswa') return <main className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">M</span><span>mhs<span className="brand-dot">.</span></span></div><div className="student-sidebar-label">Portal mahasiswa</div><div className="sidebar-footer"><span className="avatar">{myProfile?.nama.slice(0, 1).toUpperCase() || 'M'}</span><span><b>{myProfile?.nama || 'Mahasiswa'}</b><small>Mahasiswa</small></span><button className="logout-button" onClick={logout} aria-label="Keluar"><Icon name="logout" /></button></div></aside><section className="content"><header className="topbar"><div className="breadcrumb"><span>Portal</span><b>/</b><strong>Profil saya</strong></div><div className="top-actions"><span className="online"><i />Akun aktif</span></div></header><div className="page-body student-profile-page"><div className="intro"><div><p className="eyebrow">PERSONAL PROFILE</p><h1>Halo, {myProfile?.nama || 'Mahasiswa'}.</h1><p className="subheading">Berikut data akademik dan proses magang Anda.</p></div></div>{error && <div className="error-banner">{error}</div>}{loading ? <div className="table-wrap"><div className="empty">Memuat profil...</div></div> : myProfile && <><div className="profile-card"><div className="profile-avatar">{myProfile.nama.slice(0, 1).toUpperCase()}</div><div className="profile-details"><span className="status"><i />Mahasiswa aktif</span><h2>{myProfile.nama}</h2><div className="profile-fields"><div><small>NIM</small><strong>{myProfile.nim}</strong></div><div><small>Program studi</small><strong>{myProfile.jurusan}</strong></div><div><small>Email</small><strong>{myProfile.email || '-'}</strong></div></div></div></div><div className="student-internship-card"><div className="student-internship-head"><div><p className="eyebrow">INTERNSHIP TRACKER</p><h2>Proses magang saya</h2></div><span>{myInternships.length} proses</span></div>{myInternships.length === 0 ? <p className="internship-empty">Belum ada proses magang yang dibuat admin.</p> : myInternships.map((item) => <div className="student-internship-item" key={item.id}><div><strong>{item.perusahaan || 'Perusahaan belum diisi'}</strong><small>{item.posisi || 'Posisi belum diisi'}</small>{item.catatan && <p>{item.catatan}</p>}{item.dokumen_url && <a href={`${API_URL}${item.dokumen_url}`} target="_blank" rel="noreferrer">Lihat dokumen aktivasi</a>}</div><em className={`status-${item.status}`}>{item.status}</em></div>)}</div></>}</div></section></main>;

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">M</span><span>mhs<span className="brand-dot">.</span></span></div><nav><p className="nav-label">Workspace</p><button className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`} onClick={() => goTo('overview')}><Icon name="grid" />Overview</button><button className={`nav-item ${activeNav === 'students' ? 'active' : ''}`} onClick={() => goTo('students')}><Icon name="users" />Mahasiswa</button><button className={`nav-item ${activeNav === 'analytics' ? 'active' : ''}`} onClick={() => goTo('analytics')}><Icon name="chart" />Analitik</button><a className="nav-item" href="/magang"><Icon name="briefcase" />Proses magang</a><p className="nav-label nav-label-lower">System</p><button className="nav-item"><Icon name="settings" />Pengaturan</button></nav><div className="sidebar-footer"><span className="avatar">AD</span><span><b>Admin Dosen</b><small>Administrator</small></span><button className="logout-button" onClick={logout} aria-label="Keluar"><Icon name="logout" /></button></div></aside>
    <section className="content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav === 'students' ? 'Mahasiswa' : activeNav === 'analytics' ? 'Analitik' : 'Overview'}</strong></div><div className="top-actions"><span className="online"><i />API connected</span><button className="icon-button" aria-label="Notifikasi">♧<span className="notification" /></button><span className="date">Jumat, 21 Agustus 2026</span></div></header>
      <div className={`page-body ${activeNav === 'students' ? 'students-only' : ''}`}><div id="overview-section" className="intro"><div><p className="eyebrow">{activeNav === 'students' ? 'DATA AKADEMIK' : activeNav === 'analytics' ? 'INSIGHT AKADEMIK' : 'FRIDAY, AUGUST 21, 2026'}</p><h1>{activeNav === 'students' ? 'Daftar mahasiswa' : activeNav === 'analytics' ? 'Analitik akademik' : 'Selamat datang, Admin.'}</h1><p className="subheading">{activeNav === 'students' ? 'Kelola seluruh data mahasiswa yang terdaftar.' : activeNav === 'analytics' ? 'Pantau gambaran data mahasiswa secara ringkas.' : 'Kelola data akademik dengan lebih sederhana hari ini.'}</p></div>{activeNav !== 'analytics' && <button className="primary-button" onClick={openCreate}><Icon name="plus" />Tambah mahasiswa</button>}</div>
        {activeNav === 'overview' && <div className="stats"><div className="stat-card"><span className="stat-icon blue"><Icon name="users" /></span><div><span>Total mahasiswa</span><strong>{students.length}</strong><small className="positive">↑ Data terdaftar</small></div><span className="sparkline blue-line">⌁</span></div><div className="stat-card"><span className="stat-icon violet">▦</span><div><span>Program studi</span><strong>{departments}</strong><small>Jurusan aktif</small></div></div><div className="stat-card"><span className="stat-icon orange">◷</span><div><span>Status sistem</span><strong className="system-status">Aktif</strong><small className="positive">● Semua layanan normal</small></div></div></div>}
        {activeNav === 'analytics' && <div className="analytics-grid"><div className="analytics-card analytics-total"><div className="analytics-card-title"><span>Total mahasiswa</span><span className="stat-icon blue"><Icon name="users" /></span></div><strong>{students.length}</strong><p className="positive">↑ Data aktif terdaftar</p><div className="analytics-track"><i style={{ width: `${Math.min(students.length * 10, 100)}%` }} /></div></div><div className="analytics-card"><div className="analytics-card-title"><span>Program studi</span><span className="stat-icon violet">▦</span></div><strong>{departments}</strong><p>Jurusan dengan mahasiswa aktif</p><div className="analytics-tags">{departmentStats.slice(0, 3).map(([department]) => <span key={department}>{department}</span>)}</div></div><div className="analytics-card distribution-card"><div className="analytics-card-title"><span>Diagram distribusi mahasiswa</span><span className="stat-icon orange">◷</span></div>{departmentStats.length === 0 ? <p className="empty">Belum ada data untuk dianalisis.</p> : <div className="chart-wrap"><svg className="student-chart" viewBox="0 0 720 260" role="img" aria-label="Diagram jumlah mahasiswa per jurusan"><line x1="48" y1="210" x2="695" y2="210" className="chart-axis" />{departmentStats.map(([department, total], index) => { const chartHeight = Math.max((total / Math.max(...departmentStats.map(([, value]) => value))) * 150, 18); const x = 72 + index * (600 / Math.max(departmentStats.length, 1)); return <g key={department}><rect x={x} y={210 - chartHeight} width="62" height={chartHeight} rx="8" className={`chart-bar chart-bar-${index % 3}`} /><text x={x + 31} y="232" textAnchor="middle" className="chart-label">{department.length > 13 ? `${department.slice(0, 12)}...` : department}</text><text x={x + 31} y={200 - chartHeight} textAnchor="middle" className="chart-value">{total}</text></g>; })}</svg></div>}</div><div className="analytics-card quality-card"><div className="analytics-card-title"><span>Kelengkapan data</span><span className="stat-icon green">✓</span></div><strong>{students.length ? '100%' : '0%'}</strong><p>Data memiliki nama, NIM, dan jurusan.</p><div className="quality-pill"><i /> Semua data tervalidasi</div></div></div>}
        {activeNav !== 'analytics' && <>
        <div id="students-section" className="section-heading"><div><h2>{activeNav === 'students' ? 'Semua data' : 'Daftar mahasiswa'}</h2><p>{activeNav === 'students' ? 'Cari dan kelola data mahasiswa dengan cepat.' : 'Kelola seluruh data mahasiswa yang terdaftar.'}</p></div><div className="table-tools"><div className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIM..." /></div><button className="filter-button">Filter <span>⌄</span></button></div></div>
        {notice && <div className="toast"><Icon name="check" />{notice}</div>}{error && !modalOpen && <div className="error-banner">{error}</div>}
        <div className="table-wrap"><table><thead><tr><th>MAHASISWA</th><th>NIM</th><th>PROGRAM STUDI</th><th>STATUS</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="empty">Memuat data mahasiswa...</td></tr> : filtered.length === 0 ? <tr><td colSpan={5} className="empty">{query ? 'Mahasiswa tidak ditemukan.' : 'Belum ada data mahasiswa.'}</td></tr> : filtered.map((student, index) => <tr key={student.id}><td><div className="student"><span className={`student-avatar avatar-${index % 5}`}>{student.nama.slice(0, 1).toUpperCase()}</span><span><b>{student.nama}</b><small>Mahasiswa aktif</small></span></div></td><td className="nim">{student.nim}</td><td>{student.jurusan}</td><td><span className="status"><i />Aktif</span></td><td><div className="row-actions"><button onClick={() => openEdit(student)} aria-label={`Edit ${student.nama}`}><Icon name="edit" /></button><button className="reset-action" onClick={() => { setResetStudent(student); setResetPassword(''); setError(''); }} aria-label={`Reset password ${student.nama}`}><Icon name="key" /></button><button className="danger" onClick={() => remove(student)} aria-label={`Hapus ${student.nama}`}><Icon name="trash" /></button></div></td></tr>)}</tbody></table><div className="table-footer"><span>Menampilkan <b>{filtered.length}</b> dari <b>{students.length}</b> mahasiswa</span><div className="pagination"><button disabled>‹</button><button className="current">1</button><button disabled>›</button></div></div></div></>}
      </div><footer>© 2026 mhs. <span>Built for better campus management.</span></footer>
    </section>
    {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><div className="modal"><div className="modal-header"><div><p className="eyebrow">DATA AKADEMIK</p><h2>{editing ? 'Edit mahasiswa' : 'Tambah mahasiswa'}</h2></div><button className="close-button" onClick={() => setModalOpen(false)} aria-label="Tutup"><Icon name="close" /></button></div><form onSubmit={submit}><label>Nama lengkap<input required value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} placeholder="Contoh: Budi Santoso" /></label><label>NIM<input required value={form.nim} onChange={(event) => setForm({ ...form, nim: event.target.value })} placeholder="Contoh: 20240001" /></label><label>Program studi<input required value={form.jurusan} onChange={(event) => setForm({ ...form, jurusan: event.target.value })} placeholder="Contoh: Teknik Informatika" /></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Batal</button><button className="primary-button" disabled={saving}>{saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Tambah mahasiswa'}</button></div></form></div></div>}
    {resetStudent && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetStudent(null); }}><div className="modal"><div className="modal-header"><div><p className="eyebrow">ACCOUNT SECURITY</p><h2>Reset password</h2></div><button className="close-button" onClick={() => setResetStudent(null)} aria-label="Tutup"><Icon name="close" /></button></div><p className="reset-copy">Buat password baru untuk <b>{resetStudent.nama}</b> ({resetStudent.nim}).</p><form onSubmit={resetStudentPassword}><label>Password baru<input type="password" required minLength={6} value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="Minimal 6 karakter" /></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setResetStudent(null)}>Batal</button><button className="primary-button" disabled={resetSaving}>{resetSaving ? 'Menyimpan...' : 'Simpan password'}</button></div></form></div></div>}
  </main>;
}