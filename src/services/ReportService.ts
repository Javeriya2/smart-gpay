import { apiClient } from './api';

export class ReportService {
  static async generateUserReport(userId: number): Promise<void> {
    const response = await apiClient.get(`/reports/user/${userId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `User_Report_${userId}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  }
}