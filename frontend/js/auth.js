function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function isCompany() {
    const user = getCurrentUser();
    return user && user.role === 'company';
}

function initAuthState() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminBtn = document.getElementById('adminBtn');
    const companyBtn = document.getElementById('companyBtn');

    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (userName) userName.textContent = `${user.first_name} ${user.last_name}`;

        if (isAdmin() && adminBtn) {
            adminBtn.classList.remove('hidden');
        }

        if (isCompany() && companyBtn) {
            companyBtn.classList.remove('hidden');
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}

async function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiCall(API_ENDPOINTS.auth.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('Connexion reussie!');
        closeLoginModal();
        initAuthState();

        if (data.user.role === 'admin') {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else if (data.user.role === 'company') {
            setTimeout(() => {
                window.location.href = 'company.html';
            }, 1000);
        } else {
            loadJobs();
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function register(event) {
    event.preventDefault();

    const first_name = document.getElementById('registerFirstName').value;
    const last_name = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;

    try {
        await apiCall(API_ENDPOINTS.auth.register, {
            method: 'POST',
            body: JSON.stringify({ email, password, first_name, last_name, phone })
        });

        showNotification('Inscription reussie! Vous pouvez maintenant vous connecter.');
        closeRegisterModal();

        document.getElementById('loginEmail').value = email;
        showLoginModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Deconnexion reussie');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginForm').reset();
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
    document.getElementById('registerForm').reset();
}

function checkAdminAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }

    if (!isAdmin()) {
        showNotification('Acces refuse. Droits administrateur requis.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthState();
});
