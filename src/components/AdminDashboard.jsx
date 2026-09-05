import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';
import logo from '../assets/logo.png';
import {
  LogOut,
  Search,
  Eye,
  Download,
  Briefcase,
  User,
  Clock,
  Shield,
  Layers,
  Sparkles,
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle,
  MapPin,
  Truck,
  Users,
  Trash2,
  Plus,
  Pencil,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard({ onBackToWeb }) {
  // Auth state
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userRole, setUserRole] = useState(null);

  // Dashboard Data state
  const [activeTab, setActiveTab] = useState('umum'); // 'umum' | 'bisnis' | 'minjel'
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Tasks specific state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [pickupWeight, setPickupWeight] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  
  // Staff State
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('operasional');

  // Edit Staff State
  const [editStaff, setEditStaff] = useState(null); // null = modal tutup
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('operasional');

  // Statistics & Settings
  const [stats, setStats] = useState({ umum: 0, bisnis: 0, minjel: 0, revenue: 0, target_revenue: 5000000 });
  const [targetRevenueInput, setTargetRevenueInput] = useState('');

  // Get active session on mount
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setUserRole(data.role);
        // Jika login sebagai operasional, pastikan tidak membuka tab bisnis
        if (data.role === 'operasional') {
          setActiveTab('tugas');
        }
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    }
  };

  // Fetch data when session changes or active tab changes
  useEffect(() => {
    if (session) {
      fetchData();
      fetchStats();
    }
  }, [session, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase tidak terkonfigurasi. Cek file .env.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Gagal masuk. Periksa email & password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setDataList([]);
  };

  const fetchStats = async () => {
    if (!supabase) return;
    try {
      const { count: countUmum } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });
      const { count: countBisnis } = await supabase
        .from('business_registrations')
        .select('*', { count: 'exact', head: true });
      const { count: countMinjel } = await supabase
        .from('minjel_registrations')
        .select('*', { count: 'exact', head: true });
        
      // Fetch target revenue from settings
      const { data: settingsData } = await supabase.from('settings').select('*').single();
      const targetRev = settingsData ? settingsData.target_revenue : 5000000;
      
      // Calculate mock revenue based on client count
      // Asumsi: Rumah Tangga = Rp 50.000/bulan, Bisnis = Rp 150.000/bulan
      const calculatedRevenue = ((countUmum || 0) * 50000) + ((countBisnis || 0) * 150000);

      setStats({
        umum: countUmum || 0,
        bisnis: countBisnis || 0,
        minjel: countMinjel || 0,
        revenue: calculatedRevenue,
        target_revenue: targetRev
      });
      setTargetRevenueInput(targetRev.toString());
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchData = async () => {
    if (!supabase) return;
    setLoadingData(true);

    try {
      if (activeTab === 'staf') {
        const { data, error } = await supabase
          .from('staff_users')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setDataList(data || []);
      } else if (activeTab === 'tugas') {
        const { data, error } = await supabase
          .from('pickup_tasks')
          .select(`
            *,
            registrations(*),
            business_registrations(*),
            minjel_registrations(*)
          `)
          .order('scheduled_date', { ascending: true });
        
        if (error) throw error;
        setDataList(data || []);
      } else {
        let tableName = 'registrations';
        if (activeTab === 'bisnis') tableName = 'business_registrations';
        if (activeTab === 'minjel') tableName = 'minjel_registrations';
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDataList(data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!scheduleDate) return toast.error('Pilih tanggal jemput!');
    
    let payload = { scheduled_date: scheduleDate, status: 'pending' };
    if (activeTab === 'bisnis') payload.business_id = selectedRecord.id;
    else if (activeTab === 'minjel') payload.minjel_id = selectedRecord.id;
    else payload.registration_id = selectedRecord.id;

    const { error } = await supabase.from('pickup_tasks').insert(payload);
    if (!error) {
        toast.success('Tugas berhasil dijadwalkan!');
        setScheduleModalOpen(false);
        setScheduleDate('');
    } else {
        toast.error('Gagal menjadwalkan: ' + error.message);
    }
  };

  const handleCompletePickup = async () => {
    if (!pickupWeight) return toast.error('Masukkan estimasi berat!');
    
    const { error } = await supabase.from('pickup_tasks').update({
        status: 'completed',
        weight_kg: parseFloat(pickupWeight),
        report_notes: pickupNotes,
        handled_by: session.user.id
    }).eq('id', selectedRecord.id);

    if (!error) {
        toast.success('Tugas selesai dan dilaporkan!');
        setCompleteModalOpen(false);
        setSelectedRecord(null);
        fetchData(); 
    } else {
        toast.error('Gagal melapor: ' + error.message);
    }
  };

  // Filter list based on search query
  const filteredData = dataList.filter((item) => {
    const query = searchQuery.toLowerCase();
    const name = (item.nama || item.nama_bisnis || '').toLowerCase();
    const emailStr = (item.email || '').toLowerCase();
    const whatsapp = (item.whatsapp || '').toLowerCase();
    const address = (item.alamat || '').toLowerCase();

    if (activeTab === 'tugas') {
      const client = item.registrations || item.business_registrations || item.minjel_registrations || {};
      const cName = (client.nama || client.nama_bisnis || '').toLowerCase();
      const cAddress = (client.alamat || '').toLowerCase();
      return cName.includes(query) || cAddress.includes(query);
    }

    return (
      name.includes(query) ||
      emailStr.includes(query) ||
      whatsapp.includes(query) ||
      address.includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  // Render Login view if not logged in
  if (!session) {
    return (
      <div className="admin-auth-container">
        <Toaster position="top-right" />
        <div className="admin-auth-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            <Shield size={44} />
          </div>
          <h2 className="admin-auth-title">Halo Admin, Selamat Datang!</h2>
          <p className="admin-auth-subtitle">Masuk ke Panel Kelola Tumpuk Sampah untuk melihat pendaftaran masuk dan memproses kerja sama.</p>

          {authError && <div className="admin-auth-error">{authError}</div>}

          <form onSubmit={handleLogin} className="admin-auth-form">
            <div className="admin-auth-group">
              <label className="admin-auth-label">Email Akses</label>
              <input
                type="email"
                className="admin-auth-input"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="admin-auth-group">
              <label className="admin-auth-label">Kata Sandi</label>
              <input
                type="password"
                className="admin-auth-input"
                placeholder="Masukkan kata sandi Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={authLoading}>
              {authLoading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          <button onClick={onBackToWeb} className="btn-back-home">
            Kembali ke Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <img src={logo} alt="Tumpuk Sampah Logo" className="admin-logo-img" />
          <span className="badge">Admin Panel</span>
          {userRole && (
            <span className="badge" style={{ backgroundColor: userRole === 'management' ? '#4F46E5' : '#059669', marginLeft: '0.5rem' }}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          )}
        </div>
        <div className="admin-nav-actions">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-content">
        {/* Statistics Grid */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <User size={24} />
            </div>
            <div className="stat-info">
              <h4>Rumah Tangga (Umum)</h4>
              <p>{stats.umum} Pendaftar</p>
            </div>
          </div>

          {userRole !== 'operasional' && (
            <div className="admin-stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                <Briefcase size={24} />
              </div>
              <div className="stat-info">
                <h4>Kemitraan Bisnis</h4>
                <p>{stats.bisnis} Mitra</p>
              </div>
            </div>
          )}

          <div className="admin-stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Sparkles size={24} />
            </div>
            <div className="stat-info">
              <h4>Setor Minyak (Minjel)</h4>
              <p>{stats.minjel} Anggota</p>
            </div>
          </div>

          {userRole && (
            <div className="admin-stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Pendapatan Bulan Ini</h4>
                <p>{formatCurrency(stats.revenue)}</p>
                
                {/* Progress Bar */}
                <div style={{ marginTop: '0.75rem', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <span>Pencapaian</span>
                    <span>Target: {formatCurrency(stats.target_revenue)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      backgroundColor: '#047857', 
                      width: `${Math.min(100, Math.round((stats.revenue / stats.target_revenue) * 100))}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.25rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {Math.round((stats.revenue / stats.target_revenue) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Controls Panel */}
        <section className="admin-controls">
          <div className="admin-tabs">
            {userRole !== 'operasional' && (
              <>
                <button className={`tab-btn ${activeTab === 'umum' ? 'active' : ''}`} onClick={() => { setActiveTab('umum'); setSearchQuery(''); }}>
                  Rumah Tangga ({stats.umum})
                </button>
                <button className={`tab-btn ${activeTab === 'bisnis' ? 'active' : ''}`} onClick={() => { setActiveTab('bisnis'); setSearchQuery(''); }}>
                  Bisnis ({stats.bisnis})
                </button>
                <button className={`tab-btn ${activeTab === 'minjel' ? 'active' : ''}`} onClick={() => { setActiveTab('minjel'); setSearchQuery(''); }}>
                  Minyak Jelantah ({stats.minjel})
                </button>
              </>
            )}
            <button className={`tab-btn ${activeTab === 'tugas' ? 'active' : ''}`} onClick={() => { setActiveTab('tugas'); setSearchQuery(''); }}>
              Tugas Penjemputan
            </button>
            {userRole === 'management' && (
              <>
                <button className={`tab-btn ${activeTab === 'staf' ? 'active' : ''}`} onClick={() => { setActiveTab('staf'); setSearchQuery(''); }}>
                  Kelola Staf
                </button>
                <button className={`tab-btn ${activeTab === 'pengaturan' ? 'active' : ''}`} onClick={() => { setActiveTab('pengaturan'); setSearchQuery(''); }}>
                  Pengaturan
                </button>
              </>
            )}
          </div>

          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama, WA, atau alamat..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Tambah Staf Section */}
        {activeTab === 'staf' && (
          <section className="admin-controls" style={{ marginBottom: '1.5rem', backgroundColor: '#F9FAFB' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18}/> Tambah Staf Baru</h4>
            <div className="staff-form-grid">
              <div>
                 <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Email Akun</label>
                 <input type="email" value={newStaffEmail} onChange={e=>setNewStaffEmail(e.target.value)} className="search-input" placeholder="email@contoh.com" style={{ width: '100%' }} />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Kata Sandi (Password)</label>
                 <input type="password" value={newStaffPassword} onChange={e=>setNewStaffPassword(e.target.value)} className="search-input" placeholder="Rahasia123!" style={{ width: '100%' }} />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Role</label>
                 <select value={newStaffRole} onChange={e=>setNewStaffRole(e.target.value)} className="search-input" style={{ width: '100%' }}>
                    <option value="operasional">Operasional (Tim Lapangan)</option>
                    <option value="management">Management (Admin)</option>
                 </select>
              </div>
              <button 
                onClick={async () => {
                  if(!newStaffEmail || !newStaffPassword) return toast.error('Email dan password wajib diisi!');
                  const { error } = await supabase.from('staff_users').insert({ email: newStaffEmail, password: newStaffPassword, role: newStaffRole });
                  if(!error) {
                    toast.success('Staf baru berhasil ditambahkan!');
                    setNewStaffEmail('');
                    setNewStaffPassword('');
                    fetchData();
                  } else {
                    toast.error('Gagal menambahkan staf');
                  }
                }}
                className="btn-auth-submit" style={{ margin: 0, padding: '0.75rem 1.5rem', height: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16}/> Tambah Staf
              </button>
            </div>
          </section>
        )}

        {/* Pengaturan Section */}
        {activeTab === 'pengaturan' && (
          <section className="admin-controls" style={{ marginBottom: '1.5rem', backgroundColor: '#F9FAFB' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18}/> Pengaturan Target Bulanan</h4>
            <div className="staff-form-grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
              <div>
                 <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>Target Pendapatan (Rp)</label>
                 <input type="number" value={targetRevenueInput} onChange={e=>setTargetRevenueInput(e.target.value)} className="search-input" placeholder="Misal: 5000000" style={{ width: '100%' }} />
              </div>
              <button 
                onClick={async () => {
                  if(!targetRevenueInput) return toast.error('Target wajib diisi!');
                  const { error } = await supabase.from('settings').update({ target_revenue: parseInt(targetRevenueInput) }).eq('id', 1);
                  if(!error) {
                    toast.success('Target berhasil diperbarui!');
                    fetchStats();
                  } else {
                    toast.error('Gagal memperbarui target');
                  }
                }}
                className="btn-auth-submit" style={{ margin: 0, padding: '0.75rem 1.5rem', height: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16}/> Simpan Pengaturan
              </button>
            </div>
          </section>
        )}
        
        {/* Data Table */}
        {activeTab !== 'pengaturan' && (
        <section className="table-wrapper">
          {loadingData ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
              <Clock className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              Memuat data...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="table-empty">
              <Layers size={32} style={{ color: 'var(--color-border)', marginBottom: '0.5rem' }} />
              <h4>Tidak Ada Data Pendaftaran</h4>
              <p>Belum ada data pendaftaran yang sesuai dengan pencarian atau filter.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                {activeTab === 'umum' && (
                  <tr>
                    <th>Tanggal Masuk</th>
                    <th>Nama</th>
                    <th>WhatsApp</th>
                    <th>Alamat</th>
                    <th>Durasi</th>
                    <th>Aksi</th>
                  </tr>
                )}
                {activeTab === 'bisnis' && (
                  <tr>
                    <th>Tanggal Masuk</th>
                    <th>Nama Bisnis</th>
                    <th>Representatif</th>
                    <th>WhatsApp</th>
                    <th>Paket</th>
                    <th>Durasi</th>
                    <th>Aksi</th>
                  </tr>
                )}
                {activeTab === 'minjel' && (
                  <tr>
                    <th>Tanggal Masuk</th>
                    <th>Nama</th>
                    <th>WhatsApp</th>
                    <th>Alamat</th>
                    <th>Frekuensi</th>
                    <th>Aksi</th>
                  </tr>
                )}
                {activeTab === 'tugas' && (
                  <tr>
                    <th>Tanggal Jemput</th>
                    <th>Klien</th>
                    <th>Status</th>
                    <th>Alamat</th>
                    <th>Berat</th>
                    <th>Aksi</th>
                  </tr>
                )}
                {activeTab === 'staf' && (
                  <tr>
                    <th>Dibuat</th>
                    <th>Email Staf</th>
                    <th>Peran (Role)</th>
                    <th>Aksi</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    {activeTab === 'umum' && (
                      <>
                        <td>{formatDate(item.created_at)}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.nama}</td>
                        <td>{item.whatsapp}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.alamat}
                        </td>
                        <td><span className="tag">{item.durasi_langganan}</span></td>
                      </>
                    )}
                    {activeTab === 'bisnis' && (
                      <>
                        <td>{formatDate(item.created_at)}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.nama_bisnis}</td>
                        <td>{item.nama} ({item.jabatan})</td>
                        <td>{item.whatsapp}</td>
                        <td><span className="tag" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>{item.paket}</span></td>
                        <td><span className="tag">{item.durasi_langganan}</span></td>
                      </>
                    )}
                    {activeTab === 'minjel' && (
                      <>
                        <td>{formatDate(item.created_at)}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.nama}</td>
                        <td>{item.whatsapp}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.alamat}
                        </td>
                        <td><span className="tag" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>{item.frekuensi_setor}</span></td>
                      </>
                    )}
                    {activeTab === 'tugas' && (() => {
                      const client = item.registrations || item.business_registrations || item.minjel_registrations || {};
                      const clientType = item.registrations ? 'Umum' : (item.business_registrations ? 'Bisnis' : 'Minjel');
                      const dateOnly = item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      return (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{dateOnly}</td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{client.nama || client.nama_bisnis}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>{clientType}</div>
                        </td>
                        <td>
                          <span className="tag" style={{ 
                            backgroundColor: item.status === 'completed' ? '#D1FAE5' : '#FEF3C7', 
                            color: item.status === 'completed' ? '#065F46' : '#92400E' 
                          }}>
                            {(item.status || 'pending').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.alamat}
                        </td>
                        <td>{item.weight_kg ? `${item.weight_kg} Kg` : '-'}</td>
                      </>
                      )
                    })()}
                    {activeTab === 'staf' && (() => {
                      const dateOnly = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                      return (
                      <>
                        <td>{dateOnly}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.email}</td>
                        <td>
                          <span className="tag" style={{ backgroundColor: item.role === 'management' ? '#EEF2FF' : '#ECFDF5', color: item.role === 'management' ? '#4338CA' : '#047857' }}>
                            {(item.role || 'operasional').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button 
                               onClick={() => {
                                 setEditStaff(item);
                                 setEditEmail(item.email);
                                 setEditPassword('');
                                 setEditRole(item.role || 'operasional');
                               }}
                               className="btn-action-view" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                               <Pencil size={14}/> Edit
                            </button>
                            <button 
                               onClick={async () => {
                                 toast((t) => (
                                   <span>
                                     Yakin hapus staf ini?
                                     <button onClick={async () => {
                                        toast.dismiss(t.id);
                                        await supabase.from('staff_users').delete().eq('id', item.id);
                                        toast.success('Staf berhasil dihapus');
                                        fetchData();
                                     }} style={{ marginLeft: '10px', background: '#DC2626', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Ya, Hapus</button>
                                     <button onClick={() => toast.dismiss(t.id)} style={{ marginLeft: '5px', background: '#E5E7EB', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                                   </span>
                                 ), { duration: 5000 });
                               }}
                               className="btn-back-home" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}>
                               <Trash2 size={14}/> Hapus
                            </button>
                          </div>
                        </td>
                      </>
                      )
                    })()}
                    {activeTab !== 'staf' && (
                      <td>
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="btn-action-view"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        )}
      </main>

      {/* Details Dialog */}
      {selectedRecord && (
        <div className="detail-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>
                {activeTab === 'tugas' 
                  ? 'Detail Tugas Penjemputan' 
                  : (activeTab === 'bisnis'
                    ? `Detail Kemitraan: ${selectedRecord.nama_bisnis}`
                    : `Detail Pendaftaran: ${selectedRecord.nama || ''}`)}
              </h3>
              <button className="detail-modal-close" onClick={() => setSelectedRecord(null)}>
                <LogOut size={18} />
              </button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID Pendaftaran</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedRecord.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tanggal Terdaftar</span>
                  <span className="detail-value">{formatDate(selectedRecord.created_at)}</span>
                </div>

                {/* TAB 1: RUMAH TANGGA / UMUM */}
                {activeTab === 'umum' && (
                  <>
                    <div className="detail-section-title">Data Profil Pendaftar</div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Lengkap</span>
                      <span className="detail-value">{selectedRecord.nama}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedRecord.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Nomor WhatsApp</span>
                      <span className="detail-value">{selectedRecord.whatsapp}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pekerjaan</span>
                      <span className="detail-value">{selectedRecord.pekerjaan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jumlah Anggota Keluarga</span>
                      <span className="detail-value">{selectedRecord.jumlah_orang} orang</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Durasi Berlangganan</span>
                      <span className="detail-value" style={{ fontWeight: 'bold' }}>{selectedRecord.durasi_langganan}</span>
                    </div>

                    <div className="detail-section-title">Lokasi Penjemputan</div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Alamat Lengkap</span>
                      <span className="detail-value">{selectedRecord.alamat}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Google Maps Link</span>
                      <span className="detail-value">
                        <a href={selectedRecord.google_maps_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                          Buka Google Maps <ExternalLink size={14} />
                        </a>
                      </span>
                    </div>

                    <div className="detail-section-title">Informasi Tambahan</div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Mengetahui TS Dari</span>
                      <span className="detail-value">{selectedRecord.dari_mana}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Alasan Ikut Berlangganan</span>
                      <span className="detail-value">"{selectedRecord.alasan}"</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Apakah Ada Masalah Persampahan?</span>
                      <span className="detail-value">{selectedRecord.masalah_persampahan}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Saran untuk TS</span>
                      <span className="detail-value">{selectedRecord.saran || '-'}</span>
                    </div>
                  </>
                )}

                {/* TAB 2: BISNIS */}
                {activeTab === 'bisnis' && (
                  <>
                    <div className="detail-section-title">Profil Instansi / Bisnis</div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Bisnis / Instansi</span>
                      <span className="detail-value" style={{ fontWeight: 'bold' }}>{selectedRecord.nama_bisnis}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tahun Berdiri</span>
                      <span className="detail-value">{selectedRecord.tahun_berdiri}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jumlah Karyawan</span>
                      <span className="detail-value">{selectedRecord.jumlah_karyawan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Alamat Operasional</span>
                      <span className="detail-value">{selectedRecord.alamat}</span>
                    </div>

                    <div className="detail-section-title">Kontak Representatif</div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Narahubung</span>
                      <span className="detail-value">{selectedRecord.nama}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jabatan</span>
                      <span className="detail-value">{selectedRecord.jabatan}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">WhatsApp</span>
                      <span className="detail-value">{selectedRecord.whatsapp}</span>
                    </div>

                    <div className="detail-section-title">Paket Layanan & Kompos</div>
                    <div className="detail-item">
                      <span className="detail-label">Paket Layanan</span>
                      <span className="detail-value" style={{ fontWeight: 'bold' }}>{selectedRecord.paket}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Durasi Kontrak</span>
                      <span className="detail-value">{selectedRecord.durasi_langganan}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Arah Hasil Olahan Kompos</span>
                      <span className="detail-value">
                        {selectedRecord.arah_kompos === 'Diambil' && 'Diambil kembali oleh Bisnis'}
                        {selectedRecord.arah_kompos === 'Didonasikan' && 'Didonasikan untuk Program Sosial TS'}
                        {selectedRecord.arah_kompos === 'Dijual' && 'Dijual kembali kepada TS (Rp5.000/kg)'}
                        {!['Diambil', 'Didonasikan', 'Dijual'].includes(selectedRecord.arah_kompos) && selectedRecord.arah_kompos}
                      </span>
                    </div>

                    <div className="detail-section-title">Persetujuan & Legalitas</div>
                    <div className="detail-item">
                      <span className="detail-label">Membaca T&C?</span>
                      <span className="detail-value">{selectedRecord.syarat_ketentuan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Bersedia Publikasi Collab?</span>
                      <span className="detail-value">{selectedRecord.collab_publikasi}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Tujuan Kerja Sama</span>
                      <span className="detail-value">"{selectedRecord.alasan_kerjasama}"</span>
                    </div>

                    <div className="detail-section-title">Unggahan Logo Bisnis</div>
                    <div className="detail-item detail-grid-full">
                      {selectedRecord.logo_bisnis ? (
                        <div className="logo-preview-box">
                          {selectedRecord.logo_bisnis.startsWith('data:image/') ||
                          selectedRecord.logo_bisnis.startsWith('http') ||
                          /\.(png|jpe?g|webp|svg|gif)/i.test(selectedRecord.logo_bisnis) ? (
                            <img
                              src={selectedRecord.logo_bisnis}
                              alt="Logo Bisnis"
                              className="logo-preview-image"
                            />
                          ) : (
                            <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                              <FileText size={32} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Logo Document File</span>
                            </div>
                          )}
                          <a
                            href={selectedRecord.logo_bisnis}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${selectedRecord.nama_bisnis.replace(/\s+/g, '_')}_logo`}
                            className="btn-download-logo"
                          >
                            <Download size={14} />
                            Buka / Download Logo
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-light)' }}>Tidak ada logo diunggah</span>
                      )}
                    </div>
                  </>
                )}


                {/* TAB TUGAS PENJEMPUTAN */}
                {activeTab === 'tugas' && (() => {
                  const client = selectedRecord.registrations || selectedRecord.business_registrations || selectedRecord.minjel_registrations || {};
                  return (
                  <>
                    <div className="detail-section-title">Status Penjemputan</div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value" style={{ fontWeight: 'bold', color: selectedRecord.status === 'completed' ? '#059669' : '#D97706' }}>
                        {(selectedRecord.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Terjadwal</span>
                      <span className="detail-value">{formatDate(selectedRecord.scheduled_date).split(' ')[0]}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Berat Terambil (Kg)</span>
                      <span className="detail-value">{selectedRecord.weight_kg ? `${selectedRecord.weight_kg} Kg` : '-'}</span>
                    </div>
                    
                    <div className="detail-section-title">Informasi Klien</div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Klien</span>
                      <span className="detail-value">{client.nama || client.nama_bisnis}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kontak WA</span>
                      <span className="detail-value">{client.whatsapp}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Alamat Penjemputan</span>
                      <span className="detail-value">{client.alamat}</span>
                    </div>
                    {client.google_maps_link && (
                      <div className="detail-item detail-grid-full">
                        <span className="detail-label">Titik Maps</span>
                        <span className="detail-value">
                          <a href={client.google_maps_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                            Buka di Google Maps <ExternalLink size={14} />
                          </a>
                        </span>
                      </div>
                    )}
                    
                    {selectedRecord.report_notes && (
                      <>
                        <div className="detail-section-title">Catatan Operasional</div>
                        <div className="detail-item detail-grid-full">
                          <span className="detail-value" style={{ fontStyle: 'italic', backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            "{selectedRecord.report_notes}"
                          </span>
                        </div>
                      </>
                    )}
                  </>
                  );
                })()}
                
                {/* TAB 3: MINYAK JELANTAH / MINJEL */}
                {activeTab === 'minjel' && (
                  <>
                    <div className="detail-section-title">Profil Anggota Minjel</div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Lengkap</span>
                      <span className="detail-value">{selectedRecord.nama}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">WhatsApp</span>
                      <span className="detail-value">{selectedRecord.whatsapp}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pekerjaan</span>
                      <span className="detail-value">{selectedRecord.pekerjaan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Rentang Usia</span>
                      <span className="detail-value">{selectedRecord.usia} tahun</span>
                    </div>

                    <div className="detail-section-title">Lokasi & Tipe Tempat</div>
                    <div className="detail-item">
                      <span className="detail-label">Jenis Lokasi</span>
                      <span className="detail-value">{selectedRecord.jenis_tempat}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Google Maps Link</span>
                      <span className="detail-value">
                        <a href={selectedRecord.google_maps_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                          Buka Google Maps <ExternalLink size={14} />
                        </a>
                      </span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Alamat Lengkap</span>
                      <span className="detail-value">{selectedRecord.alamat}</span>
                    </div>

                    <div className="detail-section-title">Rencana Penyetoran Minyak</div>
                    <div className="detail-item">
                      <span className="detail-label">Frekuensi Setor</span>
                      <span className="detail-value" style={{ fontWeight: 'bold' }}>{selectedRecord.frekuensi_setor}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Metode Penukaran</span>
                      <span className="detail-value">{selectedRecord.metode_tukar}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Kendala Mengelola Minyak Jelantah</span>
                      <span className="detail-value">"{selectedRecord.kendala}"</span>
                    </div>

                    <div className="detail-section-title">Informasi Tambahan</div>
                    <div className="detail-item">
                      <span className="detail-label">Tau Minjel TS Dari</span>
                      <span className="detail-value">{selectedRecord.dari_mana}</span>
                    </div>
                    <div className="detail-item detail-grid-full">
                      <span className="detail-label">Pertanyaan / Saran</span>
                      <span className="detail-value">{selectedRecord.pertanyaan_saran || '-'}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Task Management Actions */}
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                {activeTab !== 'tugas' && userRole === 'management' && !scheduleModalOpen && (
                   <button className="btn-auth-submit" onClick={() => setScheduleModalOpen(true)} style={{ backgroundColor: '#059669', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                     <Calendar size={18} /> Buat Jadwal Jemput
                   </button>
                )}
                
                {scheduleModalOpen && (
                   <div style={{ padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '0.5rem' }}>
                     <h4 style={{ marginBottom: '0.5rem' }}>Pilih Tanggal Penjemputan</h4>
                     <input type="date" className="admin-auth-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                     <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                       <button className="btn-auth-submit" onClick={handleSchedulePickup}>Simpan Jadwal</button>
                       <button className="btn-back-home" style={{ marginTop: 0 }} onClick={() => setScheduleModalOpen(false)}>Batal</button>
                     </div>
                   </div>
                )}

                {activeTab === 'tugas' && selectedRecord.status === 'pending' && userRole === 'operasional' && !completeModalOpen && (
                   <button className="btn-auth-submit" onClick={() => setCompleteModalOpen(true)} style={{ backgroundColor: '#059669', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                     <Truck size={18} /> Selesaikan Penjemputan
                   </button>
                )}

                {completeModalOpen && (
                   <div style={{ padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '0.5rem' }}>
                     <h4 style={{ marginBottom: '1rem' }}>Laporan Hasil Jemput</h4>
                     <div className="admin-auth-group">
                       <label className="admin-auth-label">Berat Sampah (Kg)</label>
                       <input type="number" step="0.1" className="admin-auth-input" value={pickupWeight} onChange={e => setPickupWeight(e.target.value)} placeholder="Misal: 5.5" />
                     </div>
                     <div className="admin-auth-group">
                       <label className="admin-auth-label">Catatan Lapangan</label>
                       <textarea className="admin-auth-input" value={pickupNotes} onChange={e => setPickupNotes(e.target.value)} placeholder="Tuliskan jika ada kendala atau catatan khusus..." rows="3"></textarea>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                       <button className="btn-auth-submit" onClick={handleCompletePickup}>Kirim Laporan</button>
                       <button className="btn-back-home" style={{ marginTop: 0 }} onClick={() => setCompleteModalOpen(false)}>Batal</button>
                     </div>
                   </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Edit Staf Modal */}
      {editStaff && (
        <div className="detail-modal-overlay" onClick={() => setEditStaff(null)}>
          <div className="detail-modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} /> Edit Staf
              </h3>
              <button className="detail-modal-close" onClick={() => setEditStaff(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="detail-modal-body">
              <div className="admin-auth-form">
                <div className="admin-auth-group">
                  <label className="admin-auth-label">Email Akun</label>
                  <input
                    type="email"
                    className="admin-auth-input"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    placeholder="email@contoh.com"
                  />
                </div>
                <div className="admin-auth-group">
                  <label className="admin-auth-label">Password Baru <span style={{ fontWeight: 400, color: 'var(--color-text-light)', fontSize: '0.8rem' }}>(kosongkan jika tidak ingin mengubah)</span></label>
                  <input
                    type="password"
                    className="admin-auth-input"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Password baru..."
                  />
                </div>
                <div className="admin-auth-group">
                  <label className="admin-auth-label">Role</label>
                  <select
                    className="admin-auth-input"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                  >
                    <option value="operasional">Operasional (Tim Lapangan)</option>
                    <option value="management">Management (Admin)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-auth-submit"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={async () => {
                      if (!editEmail) return toast.error('Email wajib diisi!');
                      const payload = { email: editEmail, role: editRole };
                      if (editPassword) payload.password = editPassword;
                      const { error } = await supabase.from('staff_users').update(payload).eq('id', editStaff.id);
                      if (!error) {
                        toast.success('Data staf berhasil diperbarui!');
                        setEditStaff(null);
                        fetchData();
                      } else {
                        toast.error('Gagal memperbarui data staf');
                      }
                    }}
                  >
                    <CheckCircle size={16} /> Simpan Perubahan
                  </button>
                  <button
                    className="btn-back-home"
                    style={{ marginTop: 0 }}
                    onClick={() => setEditStaff(null)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
