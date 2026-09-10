import { apiClient } from './api';

export class BigQuerySyncService {
  static async syncDatabase(): Promise<string> {
   const response = await apiClient.post('/sync-bigquery', {}, {
  timeout: 120000,
});
    return response.data;
  }
}