import { fetchCollectionData } from './firestoreHelper';

const PATHS = [
  'logistik/operations/activity_logs',
  { parentCol: 'logistik', parentDoc: 'operations', subCol: 'activity_logs' }
];

export const getActivityLogs = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'log-001', user: 'Admin Logistik', action: 'Inisialisasi Sistem Firebase', timestamp: new Date().toISOString() }
  ]);
};
