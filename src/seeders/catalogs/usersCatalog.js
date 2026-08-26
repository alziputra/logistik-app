export const usersCatalog = {
  name: 'Users (Pengguna)',
  paths: ['logistik/auth/users'],
  items: [
    { id: 'usr-001', nama: 'Admin Logistik', name: 'Admin Logistik', email: 'admin@logistik.co.id', role: 'admin', created_at: new Date().toISOString() },
    { id: 'usr-002', nama: 'User Operasional', name: 'User Operasional', email: 'user@logistik.co.id', role: 'user', created_at: new Date().toISOString() }
  ]
};
