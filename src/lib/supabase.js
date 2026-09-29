class APISupabase {
  constructor() {
    this.authListeners = [];
    this.auth = {
      signInWithPassword: async ({ email, password }) => {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        this.authListeners.forEach(cb => cb('SIGNED_IN', data.data.session));
        return data;
      },
      signOut: async () => {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' })
        });
        this.authListeners.forEach(cb => cb('SIGNED_OUT', null));
      },
      getSession: async () => {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'session' })
        });
        return await res.json();
      },
      onAuthStateChange: (cb) => {
        this.authListeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {
          this.authListeners = this.authListeners.filter(l => l !== cb);
        } } } };
      }
    };
    
    // We only need to mock storage for the business logos. In a real app we'd save to public directory or S3.
    this.storage = {
      from: (bucket) => ({
        upload: async (path, file) => {
          // Mock upload success
          return { data: { path }, error: null };
        },
        getPublicUrl: (path) => {
          return { data: { publicUrl: '/mock-logo.png' } };
        }
      })
    };
  }

  from(table) {
    const apiCall = async (action, payload = null, filterCol = null, filterVal = undefined) => {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, table, payload, filterCol, filterVal })
      });
      return await res.json();
    };

    return {
      select: (fields) => {
        let isSingle = false;
        let isCount = false;
        if (fields && typeof fields === 'object' && fields.count === 'exact') {
           isCount = true;
        }

        const selectObj = {
          eq: (col, val) => {
            return {
              single: async () => {
                if (table === 'user_roles') {
                   // Special case since we combined role into the session JWT
                   const res = await fetch('/api/auth', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'session' })
                   });
                   const data = await res.json();
                   if (data.data.session) {
                      return { data: { role: data.data.session.role }, error: null };
                   }
                   return { data: null, error: null };
                }
                const result = await apiCall('select', null, col, val);
                return { data: result.data ? result.data[0] : null, error: result.error };
              }
            }
          },
          single: async () => {
             const result = await apiCall('select');
             return { data: result.data ? result.data[0] : null, error: result.error };
          },
          order: async (col, opts) => {
             const result = await apiCall('select');
             // Simplistic client-side sorting since sqlite select returns all for now
             if (result.data) {
                result.data.sort((a, b) => {
                   if (a[col] < b[col]) return opts.ascending ? -1 : 1;
                   if (a[col] > b[col]) return opts.ascending ? 1 : -1;
                   return 0;
                });
             }
             return result;
          },
          then: function(resolve) {
             if (isCount) {
                apiCall('count').then(resolve);
             } else {
                apiCall('select').then(resolve);
             }
          }
        };
        return selectObj;
      },
      insert: async (payload) => { if (Array.isArray(payload)) payload = payload[0];
        return await apiCall('insert', payload);
      },
      delete: () => {
         return {
            eq: async (col, val) => {
               return await apiCall('delete', null, col, val);
            }
         }
      },
      update: (payload) => {
        return {
          eq: async (col, val) => {
             return await apiCall('update', payload, col, val);
          }
        }
      }
    };
  }
}

export const supabase = new APISupabase();
