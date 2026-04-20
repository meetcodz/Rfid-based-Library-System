/**
 * API Service for connecting the Library Management Frontend to the Django Backend.
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Utility to extract the results array from a paginated response.
 */
const unwrap = async (response: Response) => {
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  const data = await response.json();
  return data.results !== undefined ? data.results : data;
};

export const apiService = {
  // Books & Catalog
  async getBooks() {
    const response = await fetch(`${API_BASE_URL}/catalog/books/`);
    return unwrap(response);
  },

  async getBookDetails(id: string) {
    const response = await fetch(`${API_BASE_URL}/catalog/books/${id}/`);
    return response.json();
  },

  // Inventory & Tracking
  async getShelfGrid() {
    const response = await fetch(`${API_BASE_URL}/inventory/grid/`);
    return unwrap(response);
  },

  async getBookCopies() {
    const response = await fetch(`${API_BASE_URL}/inventory/copies/`);
    return unwrap(response);
  },

  // Dashboard & Analytics
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/reports/analytics/`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json(); // Analytics is usually a single object, not paginated
  },

  // Circulation
  async getIssueRecords() {
    const response = await fetch(`${API_BASE_URL}/circulation/issues/`);
    return unwrap(response);
  },

  async issueBook(data: { copy: string; member: string; due_date: string }) {
    const response = await fetch(`${API_BASE_URL}/circulation/issues/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async returnBook(issueId: string) {
    const response = await fetch(`${API_BASE_URL}/circulation/issues/${issueId}/return/`, {
      method: 'POST',
    });
    return response.json();
  },

  // Alerts & Notifications
  async getAlerts() {
    // Mapping missing reports to alerts
    const response = await fetch(`${API_BASE_URL}/scanner/missing-reports/`);
    return unwrap(response);
  },

  // Members
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/members/profiles/`);
    return unwrap(response);
  },
};
