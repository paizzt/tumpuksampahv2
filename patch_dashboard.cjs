const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

// 1. Add icons
content = content.replace(
  'ExternalLink,\n} from \'lucide-react\';',
  'ExternalLink,\n  Calendar,\n  CheckCircle,\n  MapPin,\n  Truck\n} from \'lucide-react\';'
);

// 2. Add state variables for schedule and report
content = content.replace(
  'const [selectedRecord, setSelectedRecord] = useState(null);',
  `const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Tasks specific state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [pickupWeight, setPickupWeight] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');`
);

// 3. Ensure operasional defaults to 'tugas'
content = content.replace(
  `        if (data.role === 'operasional') {
          setActiveTab('umum');
        }`,
  `        if (data.role === 'operasional') {
          setActiveTab('tugas');
        }`
);

// 4. Update fetchData to handle 'tugas' tab
const oldFetchData = `  const fetchData = async () => {
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
      console.error(\`Error fetching \${tableName}:\`, err);
    } finally {
      setLoadingData(false);
    }
  };`;

const newFetchData = `  const fetchData = async () => {
    if (!supabase) return;
    setLoadingData(true);

    try {
      if (activeTab === 'tugas') {
        const { data, error } = await supabase
          .from('pickup_tasks')
          .select(\`
            *,
            registrations(*),
            business_registrations(*),
            minjel_registrations(*)
          \`)
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
    if (!scheduleDate) return alert('Pilih tanggal jemput!');
    
    let payload = { scheduled_date: scheduleDate, status: 'pending' };
    if (activeTab === 'bisnis') payload.business_id = selectedRecord.id;
    else if (activeTab === 'minjel') payload.minjel_id = selectedRecord.id;
    else payload.registration_id = selectedRecord.id;

    const { error } = await supabase.from('pickup_tasks').insert(payload);
    if (!error) {
        alert('Tugas berhasil dijadwalkan!');
        setScheduleModalOpen(false);
        setScheduleDate('');
    } else {
        alert('Gagal menjadwalkan: ' + error.message);
    }
  };

  const handleCompletePickup = async () => {
    if (!pickupWeight) return alert('Masukkan estimasi berat!');
    
    const { error } = await supabase.from('pickup_tasks').update({
        status: 'completed',
        weight_kg: parseFloat(pickupWeight),
        report_notes: pickupNotes,
        handled_by: session.user.id
    }).eq('id', selectedRecord.id);

    if (!error) {
        alert('Tugas selesai dan dilaporkan!');
        setCompleteModalOpen(false);
        setSelectedRecord(null);
        fetchData(); 
    } else {
        alert('Gagal melapor: ' + error.message);
    }
  };`;

content = content.replace(oldFetchData, newFetchData);

// 5. Update tabs UI (line ~267)
const oldTabsUI = `          <div className="admin-tabs">
            <button
              className={\`tab-btn \${activeTab === 'umum' ? 'active' : ''}\`}
              onClick={() => {
                setActiveTab('umum');
                setSearchQuery('');
              }}
            >
              Rumah Tangga ({stats.umum})
            </button>
            {userRole !== 'operasional' && (
              <button
                className={\`tab-btn \${activeTab === 'bisnis' ? 'active' : ''}\`}
                onClick={() => {
                  setActiveTab('bisnis');
                  setSearchQuery('');
                }}
              >
                Bisnis ({stats.bisnis})
              </button>
            )}
            <button
              className={\`tab-btn \${activeTab === 'minjel' ? 'active' : ''}\`}
              onClick={() => {
                setActiveTab('minjel');
                setSearchQuery('');
              }}
            >
              Minyak Jelantah ({stats.minjel})
            </button>
          </div>`;

const newTabsUI = `          <div className="admin-tabs">
            {userRole !== 'operasional' && (
              <>
                <button className={\`tab-btn \${activeTab === 'umum' ? 'active' : ''}\`} onClick={() => { setActiveTab('umum'); setSearchQuery(''); }}>
                  Rumah Tangga ({stats.umum})
                </button>
                <button className={\`tab-btn \${activeTab === 'bisnis' ? 'active' : ''}\`} onClick={() => { setActiveTab('bisnis'); setSearchQuery(''); }}>
                  Bisnis ({stats.bisnis})
                </button>
                <button className={\`tab-btn \${activeTab === 'minjel' ? 'active' : ''}\`} onClick={() => { setActiveTab('minjel'); setSearchQuery(''); }}>
                  Minyak Jelantah ({stats.minjel})
                </button>
              </>
            )}
            <button className={\`tab-btn \${activeTab === 'tugas' ? 'active' : ''}\`} onClick={() => { setActiveTab('tugas'); setSearchQuery(''); }}>
              Tugas Penjemputan
            </button>
          </div>`;

content = content.replace(oldTabsUI, newTabsUI);

// 6. Filter logic for tugas
const oldFilter = `    return (
      name.includes(query) ||
      emailStr.includes(query) ||
      whatsapp.includes(query) ||
      address.includes(query)
    );
  });`;

const newFilter = `    if (activeTab === 'tugas') {
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
  });`;

content = content.replace(oldFilter, newFilter);

// 7. Render Table Headers for tugas
const oldTableHead = `                {activeTab === 'minjel' && (
                  <tr>
                    <th>Tanggal Masuk</th>
                    <th>Nama</th>
                    <th>WhatsApp</th>
                    <th>Alamat</th>
                    <th>Frekuensi</th>
                    <th>Aksi</th>
                  </tr>
                )}`;

const newTableHead = `                {activeTab === 'minjel' && (
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
                )}`;

content = content.replace(oldTableHead, newTableHead);

// 8. Render Table Body for tugas
const oldTableBody = `                    {activeTab === 'minjel' && (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{item.nama}</td>
                        <td>{item.whatsapp}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.alamat}
                        </td>
                        <td><span className="tag" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>{item.frekuensi_setor}</span></td>
                      </>
                    )}`;

const newTableBody = `                    {activeTab === 'minjel' && (
                      <>
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
                      return (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{formatDate(item.scheduled_date).split(' ')[0]}</td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{client.nama || client.nama_bisnis}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>{clientType}</div>
                        </td>
                        <td>
                          <span className="tag" style={{ 
                            backgroundColor: item.status === 'completed' ? '#D1FAE5' : '#FEF3C7', 
                            color: item.status === 'completed' ? '#065F46' : '#92400E' 
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.alamat}
                        </td>
                        <td>{item.weight_kg ? \`\${item.weight_kg} Kg\` : '-'}</td>
                      </>
                      )
                    })()}`;

content = content.replace(oldTableBody, newTableBody);

// 9. Add action buttons inside modal body for scheduling (Management) or reporting (Operasional)
const oldModalHeader = `            <div className="detail-modal-header">
              <h3>
                {activeTab === 'bisnis'
                  ? \`Detail Kemitraan: \${selectedRecord.nama_bisnis}\`
                  : \`Detail Pendaftaran: \${selectedRecord.nama}\`}
              </h3>`;

const newModalHeader = `            <div className="detail-modal-header">
              <h3>
                {activeTab === 'tugas' 
                  ? 'Detail Tugas Penjemputan' 
                  : (activeTab === 'bisnis'
                    ? \`Detail Kemitraan: \${selectedRecord.nama_bisnis}\`
                    : \`Detail Pendaftaran: \${selectedRecord.nama || ''}\`)}
              </h3>`;

content = content.replace(oldModalHeader, newModalHeader);

const oldModalEnd = `              </div>
            </div>
          </div>
        </div>
      )}`;

const newModalEnd = `              </div>
              
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
      )}`;

content = content.replace(oldModalEnd, newModalEnd);

// 10. Update the Tab 3 block to handle 'tugas' content view
const tabsDetailsBlock = `                {/* TAB 3: MINYAK JELANTAH / MINJEL */}`;
const tasksDetailBlock = `
                {/* TAB TUGAS PENJEMPUTAN */}
                {activeTab === 'tugas' && (() => {
                  const client = selectedRecord.registrations || selectedRecord.business_registrations || selectedRecord.minjel_registrations || {};
                  return (
                  <>
                    <div className="detail-section-title">Status Penjemputan</div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value" style={{ fontWeight: 'bold', color: selectedRecord.status === 'completed' ? '#059669' : '#D97706' }}>
                        {selectedRecord.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Terjadwal</span>
                      <span className="detail-value">{formatDate(selectedRecord.scheduled_date).split(' ')[0]}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Berat Terambil (Kg)</span>
                      <span className="detail-value">{selectedRecord.weight_kg ? \`\${selectedRecord.weight_kg} Kg\` : '-'}</span>
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
                
                {/* TAB 3: MINYAK JELANTAH / MINJEL */}`;

content = content.replace(tabsDetailsBlock, tasksDetailBlock);

// Finally, update the created_at in tasks mapping so that date displays nicely
// Since we used formatDate which formats datetime, we will keep it but split string

fs.writeFileSync('src/components/AdminDashboard.jsx', content);
console.log('Patched AdminDashboard.jsx');
