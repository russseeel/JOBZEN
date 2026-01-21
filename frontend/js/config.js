const API_BASE_URL = 'http://localhost:3000/api';

const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        profile: `${API_BASE_URL}/auth/profile`
    },
    advertisements: {
        getAll: `${API_BASE_URL}/advertisements`,
        getById: (id) => `${API_BASE_URL}/advertisements/${id}`,
        create: `${API_BASE_URL}/advertisements`,
        update: (id) => `${API_BASE_URL}/advertisements/${id}`,
        delete: (id) => `${API_BASE_URL}/advertisements/${id}`
    },
    applications: {
        getAll: `${API_BASE_URL}/applications`,
        getById: (id) => `${API_BASE_URL}/applications/${id}`,
        create: `${API_BASE_URL}/applications`,
        updateStatus: (id) => `${API_BASE_URL}/applications/${id}/status`,
        delete: (id) => `${API_BASE_URL}/applications/${id}`,
        myApplications: `${API_BASE_URL}/applications/my-applications`
    },
    companies: {
        getAll: `${API_BASE_URL}/companies`,
        getById: (id) => `${API_BASE_URL}/companies/${id}`,
        create: `${API_BASE_URL}/companies`,
        update: (id) => `${API_BASE_URL}/companies/${id}`,
        delete: (id) => `${API_BASE_URL}/companies/${id}`
    },
    users: {
        getAll: `${API_BASE_URL}/users`,
        getById: (id) => `${API_BASE_URL}/users/${id}`,
        create: `${API_BASE_URL}/users`,
        update: (id) => `${API_BASE_URL}/users/${id}`,
        delete: (id) => `${API_BASE_URL}/users/${id}`
    }
};

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Une erreur est survenue');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}
