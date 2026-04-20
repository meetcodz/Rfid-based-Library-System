/**
 * API Service for connecting the Library Management Frontend to the Django Backend.
 */

const API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  // Books & Catalog
  async getBooks() {
    const response = await fetch(`${API_BASE_URL}/catalog/books/`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  },

  async getBookDetails(id: string) {
    const response = await fetch(`${API_BASE_URL}/catalog/books/${id}/`);
    return response.json();
  },

  // Inventory & Tracking
  async getShelfGrid() {
    const response = await fetch(`${API_BASE_URL}/inventory/grid/`);
    if (!response.ok) throw new Error('Failed to fetch shelf grid');
    return response.json();
  },

  async getBookCopies() {
    const response = await fetch(`${API_BASE_URL}/inventory/copies/`);
    return response.json();
  },

  // Dashboard & Analytics
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/reports/analytics/`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  // Circulation
  async getIssueRecords() {
    const response = await fetch(`${API_BASE_URL}/circulation/issues/`);
    return response.json();
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
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  // Members
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/members/profiles/`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },
};
