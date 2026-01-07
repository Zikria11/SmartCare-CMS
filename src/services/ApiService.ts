const API_BASE_URL = 'http://localhost:5056/api'; // Update this to match your backend URL

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token might be expired, clear it and redirect to login
      this.clearToken();
      window.location.href = '/auth';
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content before trying to parse as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // For responses without JSON content, return the response object
      // or just return a success indicator
      return response.text().then(text => {
        try {
          return JSON.parse(text);
        } catch {
          // If response is not JSON, return true to indicate success
          return text ? text : true;
        }
      });
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  // Appointment methods
  async getAppointments(userId?: string, role?: string) {
    let endpoint = '/appointments';
    if (userId && role) {
      endpoint += `?userId=${userId}&role=${role}`;
    }
    return this.request(endpoint);
  }

  async getAppointment(id: string) {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(appointmentData: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    notes?: string;
    isOnline: boolean;
  }) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: any) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Medical History methods
  async getMedicalHistories(patientId?: string, doctorId?: string) {
    let endpoint = '/medicalhistory';
    if (patientId) {
      endpoint += `?patientId=${patientId}`;
    } else if (doctorId) {
      endpoint += `?doctorId=${doctorId}`;
    }
    return this.request(endpoint);
  }

  async getMedicalHistory(id: string) {
    return this.request(`/medicalhistory/${id}`);
  }

  async createMedicalHistory(historyData: {
    patientId: string;
    doctorId?: string;
    title: string;
    description: string;
    diagnosis?: string;
    treatment?: string;
    medications: string[];
    allergies: string[];
    symptoms: string[];
    vitalSigns?: any;
    visitDate: string;
    nextAppointmentDate?: string;
    isShared: boolean;
    sharedWith: string[];
  }) {
    return this.request('/medicalhistory', {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  }

  async updateMedicalHistory(id: string, historyData: any) {
    return this.request(`/medicalhistory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(historyData),
    });
  }

  async deleteMedicalHistory(id: string) {
    return this.request(`/medicalhistory/${id}`, {
      method: 'DELETE',
    });
  }

  // Lab Report methods
  async getLabReports(patientId?: string, labTechnicianId?: string) {
    let endpoint = '/labreports';
    if (patientId) {
      endpoint += `?patientId=${patientId}`;
    } else if (labTechnicianId) {
      endpoint += `?labTechnicianId=${labTechnicianId}`;
    }
    return this.request(endpoint);
  }

  async getLabReport(id: string) {
    return this.request(`/labreports/${id}`);
  }

  async createLabReport(reportData: {
    patientId: string;
    doctorId?: string;
    labTechnicianId?: string;
    reportTitle: string;
    reportType: string;
    results: any;
    notes?: string;
    fileUrl?: string;
    isShared: boolean;
    sharedWith: string[];
    billingInfo?: any;
  }) {
    return this.request('/labreports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateLabReport(id: string, reportData: any) {
    return this.request(`/labreports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteLabReport(id: string) {
    return this.request(`/labreports/${id}`, {
      method: 'DELETE',
    });
  }

  // Billing methods
  async getBillings(patientId?: string, serviceType?: string) {
    let endpoint = '/billing';
    if (patientId) {
      endpoint += `?patientId=${patientId}`;
    }
    if (serviceType) {
      endpoint += `${patientId ? '&' : '?'}serviceType=${serviceType}`;
    }
    return this.request(endpoint);
  }

  async getBilling(id: string) {
    return this.request(`/billing/${id}`);
  }

  async createBilling(billingData: {
    patientId: string;
    appointmentId?: string;
    labReportId?: string;
    serviceType: string;
    description: string;
    amount: number;
    currency: string;
    dueDate: string;
    notes?: string;
    invoiceNumber?: string;
  }) {
    return this.request('/billing', {
      method: 'POST',
      body: JSON.stringify(billingData),
    });
  }

  async updateBilling(id: string, billingData: any) {
    return this.request(`/billing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billingData),
    });
  }

  async deleteBilling(id: string) {
    return this.request(`/billing/${id}`, {
      method: 'DELETE',
    });
  }

  // User methods (for admin)
  async getUsers(role?: string, approvalStatus?: string) {
    let endpoint = '/users';
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (approvalStatus) params.append('approvalStatus', approvalStatus);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request(endpoint);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async approveUser(id: string, tempPassword?: string) {
    return this.request(`/users/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ temporaryPassword: tempPassword }),
    });
  }

  async rejectUser(id: string) {
    return this.request(`/users/${id}/reject`, {
      method: 'PUT',
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getPendingApprovals() {
    return this.request('/users/pending-approvals');
  }

  // Dashboard stats
  async getDashboardStats(userId?: string, role?: string) {
    let endpoint = '/dashboard/stats';
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request(endpoint);
  }

  // Doctor methods
  async getDoctors(city?: string, specialization?: string) {
    let endpoint = '/doctors';
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (specialization) params.append('specialization', specialization);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request(endpoint);
  }

  // Duplicate cleanup methods (admin)
  async getDuplicateDoctorsPreview() {
    return this.request('/doctors/duplicates-preview');
  }

  async deleteDuplicateDoctors(ids: string[]) {
    return this.request('/doctors/delete-duplicates', {
      method: 'POST',
      body: JSON.stringify(ids),
    });
  }

  // Queue methods
  async getDoctorQueue(doctorId: string) {
    return this.request(`/queue/doctor/${doctorId}`);
  }

  async callNextPatient(doctorId: string) {
    return this.request(`/queue/doctor/${doctorId}/call-next`, {
      method: 'POST',
    });
  }

  async completeAppointment(appointmentId: string) {
    return this.request(`/queue/appointment/${appointmentId}/complete`, {
      method: 'POST',
    });
  }

  async cancelAppointment(appointmentId: string) {
    return this.request(`/queue/appointment/${appointmentId}/cancel`, {
      method: 'POST',
    });
  }

  // Notification methods
  async getNotifications(userId: string) {
    return this.request(`/notifications/user/${userId}`);
  }

  async createNotification(notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    userId: string;
    relatedId?: string;
  }) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Messaging methods
  async getConversations(userId: string) {
    return this.request(`/conversations/user/${userId}`);
  }

  async getMessages(userId: string) {
    return this.request(`/messages/user/${userId}`);
  }

  async createMessage(messageData: {
    receiverId: string;
    content: string;
    senderId: string;
  }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(conversationId: string, messageId?: string) {
    let endpoint = `/messages/${conversationId}/read`;
    if (messageId) {
      endpoint += `/${messageId}`;
    }
    return this.request(endpoint, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();