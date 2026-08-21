import { fetchCollectionData } from './firestoreHelper';

const PATHS = [
  'logistik/operations/activity_logs',
  'logistik/operations/activity-logs',
  'operations/activity_logs',
  'activity_logs',
  'activity-logs'
];

export const getActivityLogs = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'log-001', user: 'Admin Logistik', action: 'Inisialisasi Sistem Firebase', timestamp: new Date().toISOString() }
  ]);
};

