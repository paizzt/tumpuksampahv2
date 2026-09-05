const fs = require('fs');

// PATCH SUPABASE.JS
let supabaseContent = fs.readFileSync('src/lib/supabase.js', 'utf8');

const oldAuthSignIn = `      signInWithPassword: async ({ email, password }) => {
        let role = null;
        if (email === 'management@tumpuksampah.com' && password === 'Manajemen123!') role = 'management';
        if (email === 'operasional@tumpuksampah.com' && password === 'Operasional123!') role = 'operasional';
        
        if (role) {
          const user = { id: role + '-123', email };
          localStorage.setItem('mock_session', JSON.stringify({ user, role }));
          this.authListeners.forEach(cb => cb('SIGNED_IN', { user }));
          return { data: { user, session: { user } }, error: null };
        }
        throw new Error('Email atau Password salah.');
      },`;

const newAuthSignIn = `      signInWithPassword: async ({ email, password }) => {
        let staffStr = localStorage.getItem('mock_staff');
        if (!staffStr) {
           const defaultStaff = [
               { id: 'management-123', email: 'management@tumpuksampah.com', password: 'Manajemen123!', role: 'management', created_at: new Date().toISOString() },
               { id: 'operasional-123', email: 'operasional@tumpuksampah.com', password: 'Operasional123!', role: 'operasional', created_at: new Date().toISOString() }
           ];
           localStorage.setItem('mock_staff', JSON.stringify(defaultStaff));
           staffStr = JSON.stringify(defaultStaff);
        }
        const staff = JSON.parse(staffStr);
        const userFound = staff.find(s => s.email === email && s.password === password);
        
        if (userFound) {
          const user = { id: userFound.id, email: userFound.email };
          const role = userFound.role;
          localStorage.setItem('mock_session', JSON.stringify({ user, role }));
          this.authListeners.forEach(cb => cb('SIGNED_IN', { user }));
          return { data: { user, session: { user } }, error: null };
        }
        throw new Error('Email atau Password salah.');
      },`;

supabaseContent = supabaseContent.replace(oldAuthSignIn, newAuthSignIn);

const oldOrderFetch = `            } else if (table === 'pickup_tasks') {
                const tasksStr = localStorage.getItem('mock_tasks');
                data = tasksStr ? JSON.parse(tasksStr) : [];
            }
            return { data, error: null, count: data.length };`;

const newOrderFetch = `            } else if (table === 'pickup_tasks') {
                const tasksStr = localStorage.getItem('mock_tasks');
                data = tasksStr ? JSON.parse(tasksStr) : [];
            } else if (table === 'staff_users') {
                const staffStr = localStorage.getItem('mock_staff');
                data = staffStr ? JSON.parse(staffStr).map(s => {
                    const {password, ...safeUser} = s;
                    return safeUser;
                }) : [];
            }
            return { data, error: null, count: data.length };`;

supabaseContent = supabaseContent.replace(oldOrderFetch, newOrderFetch);

const oldInsert = `      insert: async (payload) => {
        if (table === 'pickup_tasks') {
           const tasksStr = localStorage.getItem('mock_tasks');
           let tasks = tasksStr ? JSON.parse(tasksStr) : [];
           const newTask = { 
              id: 'task-' + Date.now(), 
              ...payload, 
              registrations: { nama: 'Klien dari Excel Demo', alamat: 'Alamat Klien', whatsapp: '0851234567' } 
           };
           tasks.push(newTask);
           localStorage.setItem('mock_tasks', JSON.stringify(tasks));
           return { error: null };
        }
        return { error: null };
      },`;

const newInsert = `      insert: async (payload) => {
        if (table === 'pickup_tasks') {
           const tasksStr = localStorage.getItem('mock_tasks');
           let tasks = tasksStr ? JSON.parse(tasksStr) : [];
           const newTask = { 
              id: 'task-' + Date.now(), 
              ...payload, 
              registrations: { nama: 'Klien dari Excel Demo', alamat: 'Alamat Klien', whatsapp: '0851234567' } 
           };
           tasks.push(newTask);
           localStorage.setItem('mock_tasks', JSON.stringify(tasks));
           return { error: null };
        }
        if (table === 'staff_users') {
           const staffStr = localStorage.getItem('mock_staff');
           let staff = staffStr ? JSON.parse(staffStr) : [];
           const newStaff = { id: 'staff-' + Date.now(), ...payload, created_at: new Date().toISOString() };
           staff.push(newStaff);
           localStorage.setItem('mock_staff', JSON.stringify(staff));
           return { error: null };
        }
        return { error: null };
      },
      delete: () => {
         return {
            eq: async (col, val) => {
               if (table === 'staff_users') {
                  const staffStr = localStorage.getItem('mock_staff');
                  if (staffStr) {
                     let staff = JSON.parse(staffStr);
                     staff = staff.filter(s => s.id !== val);
                     localStorage.setItem('mock_staff', JSON.stringify(staff));
                  }
               }
               return { error: null };
            }
         }
      },`;

supabaseContent = supabaseContent.replace(oldInsert, newInsert);

fs.writeFileSync('src/lib/supabase.js', supabaseContent);


// PATCH ADMINDASHBOARD.JSX
let dashContent = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

// Icons
dashContent = dashContent.replace(
  'Truck\n} from \'lucide-react\';',
  'Truck,\n  Users,\n  Trash2,\n  Plus\n} from \'lucide-react\';'
);

// State
dashContent = dashContent.replace(
  'const [pickupNotes, setPickupNotes] = useState(\'\');',
  `const [pickupNotes, setPickupNotes] = useState('');
  
  // Staff State
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('operasional');`
);

// Tab UI
dashContent = dashContent.replace(
  `            <button className={\`tab-btn \${activeTab === 'tugas' ? 'active' : ''}\`} onClick={() => { setActiveTab('tugas'); setSearchQuery(''); }}>
              Tugas Penjemputan
            </button>
          </div>`,
  `            <button className={\`tab-btn \${activeTab === 'tugas' ? 'active' : ''}\`} onClick={() => { setActiveTab('tugas'); setSearchQuery(''); }}>
              Tugas Penjemputan
            </button>
            {userRole === 'management' && (
              <button className={\`tab-btn \${activeTab === 'staf' ? 'active' : ''}\`} onClick={() => { setActiveTab('staf'); setSearchQuery(''); }}>
                Kelola Staf
              </button>
            )}
          </div>`
);

// FetchData Logic
const fetchTarget = `      if (activeTab === 'tugas') {`;
const fetchReplacement = `      if (activeTab === 'staf') {
        const { data, error } = await supabase
          .from('staff_users')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setDataList(data || []);
      } else if (activeTab === 'tugas') {`;
dashContent = dashContent.replace(fetchTarget, fetchReplacement);

// Table Headers
const theadTarget = `                {activeTab === 'tugas' && (
                  <tr>
                    <th>Tanggal Jemput</th>
                    <th>Klien</th>
                    <th>Status</th>
                    <th>Alamat</th>
                    <th>Berat</th>
                    <th>Aksi</th>
                  </tr>
                )}`;
const theadReplacement = `                {activeTab === 'tugas' && (
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
                )}`;
dashContent = dashContent.replace(theadTarget, theadReplacement);

// Table Body
const tbodyTarget = `                      )
                    })()}`;
const tbodyReplacement = `                      )
                    })()}
                    {activeTab === 'staf' && (
                      <>
                        <td>{formatDate(item.created_at).split(' ')[0]}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.email}</td>
                        <td>
                          <span className="tag" style={{ backgroundColor: item.role === 'management' ? '#EEF2FF' : '#ECFDF5', color: item.role === 'management' ? '#4338CA' : '#047857' }}>
                            {item.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button 
                             onClick={async () => {
                               if(window.confirm('Yakin ingin menghapus staf ini?')) {
                                  await supabase.from('staff_users').delete().eq('id', item.id);
                                  fetchData();
                               }
                             }}
                             className="btn-back-home" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}>
                             <Trash2 size={14}/> Hapus
                          </button>
                        </td>
                      </>
                    )}`;
dashContent = dashContent.replace(tbodyTarget, tbodyReplacement);

// Add Staff Form (Right above Table Wrapper)
const formTarget = `        {/* Data Table */}`;
const formReplacement = `        {/* Tambah Staf Section */}
        {activeTab === 'staf' && (
          <section className="admin-controls" style={{ marginBottom: '1.5rem', backgroundColor: '#F9FAFB' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18}/> Tambah Staf Baru</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
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
                  if(!newStaffEmail || !newStaffPassword) return alert('Email dan password wajib diisi!');
                  const { error } = await supabase.from('staff_users').insert({ email: newStaffEmail, password: newStaffPassword, role: newStaffRole });
                  if(!error) {
                    setNewStaffEmail('');
                    setNewStaffPassword('');
                    fetchData();
                  }
                }}
                className="btn-auth-submit" style={{ margin: 0, padding: '0.75rem 1.5rem', height: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16}/> Tambah Staf
              </button>
            </div>
          </section>
        )}
        
        {/* Data Table */}`;
dashContent = dashContent.replace(formTarget, formReplacement);

fs.writeFileSync('src/components/AdminDashboard.jsx', dashContent);
console.log('Patched AdminDashboard for Staff Management');
