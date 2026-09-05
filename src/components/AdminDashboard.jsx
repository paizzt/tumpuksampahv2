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
} from 'lucide-react';

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

  // Statistics
  const [stats, setStats] = useState({ umum: 0, bisnis: 0, minjel: 0 });

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
          setActiveTab('umum');
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

      setStats({
        umum: countUmum || 0,
        bisnis: countBisnis || 0,
        minjel: countMinjel || 0,
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchData = async () => {
    if (!supabase) return;
    setLoadingData(true);
    let tableName = 'registrations';
    if (activeTab === 'bisnis') tableName = 'business_registrations';
    if (activeTab === 'minjel') tableName = 'minjel_registrations';

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDataList(data || []);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoadingData(false);
    }
  };

  // Filter list based on search query
  const filteredData = dataList.filter((item) => {
    const query = searchQuery.toLowerCase();
    const name = (item.nama || item.nama_bisnis || '').toLowerCase();
    const emailStr = (item.email || '').toLowerCase();
    const whatsapp = (item.whatsapp || '').toLowerCase();
    const address = (item.alamat || '').toLowerCase();

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

  // Render Login view if not logged in
  if (!session) {
    return (
      <div className="admin-auth-container">
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
        </section>

        {/* Controls Panel */}
        <section className="admin-controls">
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'umum' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('umum');
                setSearchQuery('');
              }}
            >
              Rumah Tangga ({stats.umum})
            </button>
            {userRole !== 'operasional' && (
              <button
                className={`tab-btn ${activeTab === 'bisnis' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('bisnis');
                  setSearchQuery('');
                }}
              >
                Bisnis ({stats.bisnis})
              </button>
            )}
            <button
              className={`tab-btn ${activeTab === 'minjel' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('minjel');
                setSearchQuery('');
              }}
            >
              Minyak Jelantah ({stats.minjel})
            </button>
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

        {/* Data Table */}
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
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.created_at)}</td>
                    {activeTab === 'umum' && (
                      <>
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
                        <td style={{ fontWeight: 'bold' }}>{item.nama_bisnis}</td>
                        <td>{item.nama} ({item.jabatan})</td>
                        <td>{item.whatsapp}</td>
                        <td><span className="tag" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>{item.paket}</span></td>
                        <td><span className="tag">{item.durasi_langganan}</span></td>
                      </>
                    )}
                    {activeTab === 'minjel' && (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{item.nama}</td>
                        <td>{item.whatsapp}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.alamat}
                        </td>
                        <td><span className="tag" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>{item.frekuensi_setor}</span></td>
                      </>
                    )}
                    <td>
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="btn-action-view"
                      >
                        <Eye size={14} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Details Dialog */}
      {selectedRecord && (
        <div className="detail-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>
                {activeTab === 'bisnis'
                  ? `Detail Kemitraan: ${selectedRecord.nama_bisnis}`
                  : `Detail Pendaftaran: ${selectedRecord.nama}`}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
