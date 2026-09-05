import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Mock implementation of Supabase Client using LocalStorage for Local Testing without Backend
class MockSupabase {
  constructor() {
    this.authListeners = [];
    this.auth = {
      signInWithPassword: async ({ email, password }) => {
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
      },
      signOut: async () => {
        localStorage.removeItem('mock_session');
        this.authListeners.forEach(cb => cb('SIGNED_OUT', null));
      },
      getSession: async () => {
        const sessionStr = localStorage.getItem('mock_session');
        if (sessionStr) return { data: { session: JSON.parse(sessionStr) } };
        return { data: { session: null } };
      },
      onAuthStateChange: (cb) => {
        this.authListeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    };
  }

  from(table) {
    const getTableData = () => {
      let data = [];
      if (table === 'registrations') {
          data = [
              { id: 'client-1', nama: 'Astria (Data Demo)', whatsapp: '085299763475', alamat: 'Perumahan Bumi Aroepala Blok B9', durasi_langganan: '3 Bulan', created_at: new Date().toISOString() },
              { id: 'client-2', nama: 'Amaliah (Data Demo)', whatsapp: '085241976115', alamat: 'Perumahan Grand Pattalassang Blok A No. 15', durasi_langganan: '3 Bulan', created_at: new Date().toISOString() },
              { id: 'client-3', nama: 'Sachiko (Data Demo)', whatsapp: '08114405142', alamat: 'Sunu 2 No 49', durasi_langganan: '3 Bulan', created_at: new Date().toISOString() }
          ];
      } else if (table === 'business_registrations') {
          data = [
              { id: 'biz-1', nama_bisnis: 'Kopi Kenangan (Demo)', nama: 'Budi', jabatan: 'Manager', whatsapp: '08123456789', alamat: 'Jl. Sudirman No 1', paket: 'Reguler', durasi_langganan: '12 Bulan', created_at: new Date().toISOString() },
              { id: 'biz-2', nama_bisnis: 'Warteg Bahari (Demo)', nama: 'Siti', jabatan: 'Owner', whatsapp: '08987654321', alamat: 'Jl. Thamrin No 5', paket: 'Premium', durasi_langganan: '6 Bulan', created_at: new Date().toISOString() }
          ];
      } else if (table === 'minjel_registrations') {
          data = [
              { id: 'minjel-1', nama: 'Ibu Ratna (Demo)', whatsapp: '081122334455', alamat: 'Jl. Melati No 10', frekuensi_setor: '1 Bulan Sekali', created_at: new Date().toISOString() }
          ];
      } else if (table === 'pickup_tasks') {
          const tasksStr = localStorage.getItem('mock_tasks');
          if (!tasksStr) {
             const defaultTasks = [
                 { id: 'task-1', scheduled_date: new Date().toISOString().split('T')[0], status: 'pending', registrations: { nama: 'Astria (Data Demo)', alamat: 'Perumahan Bumi Aroepala Blok B9', whatsapp: '085299763475' } },
                 { id: 'task-2', scheduled_date: new Date().toISOString().split('T')[0], status: 'completed', weight_kg: 5.5, report_notes: 'Sampah sudah dipilah dengan baik', registrations: { nama: 'Amaliah (Data Demo)', alamat: 'Perumahan Grand Pattalassang Blok A No. 15', whatsapp: '085241976115' } }
             ];
             localStorage.setItem('mock_tasks', JSON.stringify(defaultTasks));
             data = defaultTasks;
          } else {
             data = JSON.parse(tasksStr);
          }
      } else if (table === 'staff_users') {
          const staffStr = localStorage.getItem('mock_staff');
          data = staffStr ? JSON.parse(staffStr).map(s => {
              const {password, ...safeUser} = s;
              return safeUser;
          }) : [];
      } else if (table === 'settings') {
          const settingsStr = localStorage.getItem('mock_settings');
          data = settingsStr ? JSON.parse(settingsStr) : [{ id: 1, target_revenue: 5000000 }];
      }
      return data;
    };

    return {
      select: (fields) => {
        const selectObj = {
          eq: (col, val) => {
            return {
              single: async () => {
                if (table === 'user_roles') {
                  const sessionStr = localStorage.getItem('mock_session');
                  if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    return { data: { role: session.role }, error: null };
                  }
                }
                if (table === 'settings') {
                  const settingsStr = localStorage.getItem('mock_settings');
                  const settings = settingsStr ? JSON.parse(settingsStr) : [{ id: 1, target_revenue: 5000000 }];
                  return { data: settings[0] || { id: 1, target_revenue: 5000000 }, error: null };
                }
                return { data: null, error: null };
              }
            }
          },
          single: async () => {
            // Called directly as select().single() without eq()
            if (table === 'settings') {
              const settingsStr = localStorage.getItem('mock_settings');
              const settings = settingsStr ? JSON.parse(settingsStr) : [{ id: 1, target_revenue: 5000000 }];
              return { data: settings[0] || { id: 1, target_revenue: 5000000 }, error: null };
            }
            return { data: null, error: null };
          },
          order: async (col, opts) => {
            const data = getTableData();
            return { data, error: null, count: data.length };
          },
          then: function(resolve) {
            const data = getTableData();
            resolve({ data, error: null, count: data.length });
          }
        };
        return selectObj;
      },
      insert: async (payload) => {
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
      },
      update: (payload) => {
        return {
          eq: async (col, val) => {
            if (table === 'pickup_tasks') {
               const tasksStr = localStorage.getItem('mock_tasks');
               let tasks = tasksStr ? JSON.parse(tasksStr) : [];
               tasks = tasks.map(t => t.id === val ? { ...t, ...payload } : t);
               localStorage.setItem('mock_tasks', JSON.stringify(tasks));
               return { error: null };
            }
            if (table === 'settings') {
               const settingsStr = localStorage.getItem('mock_settings');
               let settings = settingsStr ? JSON.parse(settingsStr) : [{ id: 1, target_revenue: 5000000 }];
               settings = settings.map(s => s[col] == val ? { ...s, ...payload } : s);
               localStorage.setItem('mock_settings', JSON.stringify(settings));
               return { error: null };
            }
            if (table === 'staff_users') {
               const staffStr = localStorage.getItem('mock_staff');
               let staff = staffStr ? JSON.parse(staffStr) : [];
               staff = staff.map(s => s[col] === val ? { ...s, ...payload } : s);
               localStorage.setItem('mock_staff', JSON.stringify(staff));
               return { error: null };
            }
            return { error: null };
          }
        }
      }
    };
  }
}

// Gunakan koneksi Supabase asli JIKA ada .env, JIKA tidak ada gunakan Mode Simulasi Lokal
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : new MockSupabase();
