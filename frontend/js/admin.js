let companiesCache = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAccess()) return;

    const user = getCurrentUser();
    document.getElementById('adminName').textContent = `${user.first_name} ${user.last_name}`;

    loadAdvertisements();
    loadCompaniesForSelect();
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    switch (tabName) {
        case 'advertisements':
            loadAdvertisements();
            break;
        case 'applications':
            loadApplications();
            break;
        case 'companies':
            loadCompanies();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

async function loadAdvertisements() {
    const container = document.getElementById('advertisementsTable');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const data = await apiCall(`${API_ENDPOINTS.advertisements.getAll}?status=all`);

        const statusColors = {
            active: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            draft: 'bg-gray-100 text-gray-800'
        };

        const statusLabels = {
            active: 'Active',
            closed: 'Fermee',
            draft: 'Brouillon'
        };

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(ad => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${ad.title}</div>
                                    <div class="text-sm text-gray-500">${ad.short_description.substring(0, 50)}...</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ad.company_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ad.location || 'N/A'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(ad.posted_date)}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ad.status]}">
                                        ${statusLabels[ad.status]}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="editAdvertisement(${ad.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteAdvertisement(${ad.id})" class="text-red-600 hover:text-red-900">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="text-center py-8 text-red-600">Erreur lors du chargement</div>';
    }
}

async function loadCompaniesForSelect() {
    try {
        const data = await apiCall(API_ENDPOINTS.companies.getAll);
        companiesCache = data.data;

        const select = document.getElementById('adCompany');
        if (select) {
            select.innerHTML = '<option value="">Selectionner une entreprise</option>' +
                data.data.map(company => `<option value="${company.id}">${company.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

function showCreateAdModal() {
    document.getElementById('adModalTitle').textContent = 'Nouvelle Annonce';
    document.getElementById('advertisementForm').reset();
    document.getElementById('adId').value = '';
    document.getElementById('adPostedDate').value = formatDateForInput(new Date());
    document.getElementById('advertisementModal').classList.add('active');
}

async function editAdvertisement(id) {
    try {
        const data = await apiCall(API_ENDPOINTS.advertisements.getById(id));
        const ad = data.data;

        document.getElementById('adModalTitle').textContent = 'Modifier l\'Annonce';
        document.getElementById('adId').value = ad.id;
        document.getElementById('adTitle').value = ad.title;
        document.getElementById('adShortDesc').value = ad.short_description;
        document.getElementById('adFullDesc').value = ad.full_description;
        document.getElementById('adCompany').value = ad.company_id;
        document.getElementById('adLocation').value = ad.location || '';
        document.getElementById('adWages').value = ad.wages || '';
        document.getElementById('adWorkingTime').value = ad.working_time || 'full-time';
        document.getElementById('adPostedDate').value = formatDateForInput(ad.posted_date);
        document.getElementById('adDeadline').value = formatDateForInput(ad.application_deadline);
        document.getElementById('adSkills').value = ad.required_skills || '';
        document.getElementById('adBenefits').value = ad.benefits || '';
        document.getElementById('adStatus').value = ad.status;

        document.getElementById('advertisementModal').classList.add('active');
    } catch (error) {
        showNotification('Erreur lors du chargement de l\'annonce', 'error');
    }
}

async function saveAdvertisement(event) {
    event.preventDefault();

    const id = document.getElementById('adId').value;
    const adData = {
        title: document.getElementById('adTitle').value,
        short_description: document.getElementById('adShortDesc').value,
        full_description: document.getElementById('adFullDesc').value,
        company_id: parseInt(document.getElementById('adCompany').value),
        location: document.getElementById('adLocation').value,
        wages: document.getElementById('adWages').value,
        working_time: document.getElementById('adWorkingTime').value,
        contract_type: document.getElementById('adWorkingTime').value,
        required_skills: document.getElementById('adSkills').value,
        benefits: document.getElementById('adBenefits').value,
        posted_date: document.getElementById('adPostedDate').value,
        application_deadline: document.getElementById('adDeadline').value || null,
        status: document.getElementById('adStatus').value,
        contact_person_id: null
    };

    try {
        if (id) {
            await apiCall(API_ENDPOINTS.advertisements.update(id), {
                method: 'PUT',
                body: JSON.stringify(adData)
            });
            showNotification('Annonce mise a jour avec succes');
        } else {
            await apiCall(API_ENDPOINTS.advertisements.create, {
                method: 'POST',
                body: JSON.stringify(adData)
            });
            showNotification('Annonce creee avec succes');
        }

        closeAdModal();
        loadAdvertisements();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteAdvertisement(id) {
    if (!confirm('Etes-vous sur de vouloir supprimer cette annonce ?')) return;

    try {
        await apiCall(API_ENDPOINTS.advertisements.delete(id), {
            method: 'DELETE'
        });
        showNotification('Annonce supprimee avec succes');
        loadAdvertisements();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function closeAdModal() {
    document.getElementById('advertisementModal').classList.remove('active');
}

async function loadApplications() {
    const container = document.getElementById('applicationsTable');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const status = document.getElementById('filterApplicationStatus')?.value || '';
        const url = status ? `${API_ENDPOINTS.applications.getAll}?status=${status}` : API_ENDPOINTS.applications.getAll;
        const data = await apiCall(url);

        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };

        const statusLabels = {
            pending: 'En attente',
            reviewed: 'Examinee',
            accepted: 'Acceptee',
            rejected: 'Rejetee'
        };

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(app => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${app.applicant_name}</div>
                                    <div class="text-sm text-gray-500">${app.applicant_email}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${app.job_title}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${app.company_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(app.applied_at)}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <select onchange="updateApplicationStatus(${app.id}, this.value)" class="px-2 py-1 text-xs rounded-full ${statusColors[app.status]}">
                                        ${Object.keys(statusLabels).map(s =>
                                            `<option value="${s}" ${s === app.status ? 'selected' : ''}>${statusLabels[s]}</option>`
                                        ).join('')}
                                    </select>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="viewApplication(${app.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="deleteApplication(${app.id})" class="text-red-600 hover:text-red-900">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="text-center py-8 text-red-600">Erreur lors du chargement</div>';
    }
}

async function updateApplicationStatus(id, status) {
    try {
        await apiCall(API_ENDPOINTS.applications.updateStatus(id), {
            method: 'PUT',
            body: JSON.stringify({ status, notes: '' })
        });
        showNotification('Statut mis a jour avec succes');
    } catch (error) {
        showNotification(error.message, 'error');
        loadApplications();
    }
}

async function viewApplication(id) {
    try {
        const data = await apiCall(API_ENDPOINTS.applications.getById(id));
        const app = data.data;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
                <div class="flex justify-between items-start mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Details de la candidature</h2>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold text-gray-700">Candidat</h3>
                        <p>${app.applicant_name}</p>
                        <p class="text-sm text-gray-600">${app.applicant_email}</p>
                        ${app.applicant_phone ? `<p class="text-sm text-gray-600">${app.applicant_phone}</p>` : ''}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Poste</h3>
                        <p>${app.job_title}</p>
                        <p class="text-sm text-gray-600">${app.company_name}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Lettre de motivation</h3>
                        <p class="text-gray-600 whitespace-pre-line">${app.cover_letter || 'Aucune lettre fournie'}</p>
                    </div>
                    ${app.resume_url ? `
                    <div>
                        <h3 class="font-semibold text-gray-700">CV</h3>
                        <a href="${app.resume_url}" target="_blank" class="text-blue-600 hover:underline">
                            <i class="fas fa-external-link-alt mr-1"></i> Voir le CV
                        </a>
                    </div>` : ''}
                    <div>
                        <h3 class="font-semibold text-gray-700">Date de candidature</h3>
                        <p class="text-gray-600">${formatDate(app.applied_at)}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        showNotification('Erreur lors du chargement de la candidature', 'error');
    }
}

async function deleteApplication(id) {
    if (!confirm('Etes-vous sur de vouloir supprimer cette candidature ?')) return;

    try {
        await apiCall(API_ENDPOINTS.applications.delete(id), {
            method: 'DELETE'
        });
        showNotification('Candidature supprimee avec succes');
        loadApplications();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function loadCompanies() {
    const container = document.getElementById('companiesTable');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const data = await apiCall(API_ENDPOINTS.companies.getAll);

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site web</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(company => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${company.name}</div>
                                    <div class="text-sm text-gray-500">${(company.description || '').substring(0, 50)}...</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${company.location || 'N/A'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${company.website ? `<a href="${company.website}" target="_blank" class="text-blue-600 hover:underline">Visiter</a>` : 'N/A'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="editCompany(${company.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteCompany(${company.id})" class="text-red-600 hover:text-red-900">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="text-center py-8 text-red-600">Erreur lors du chargement</div>';
    }
}

function showCreateCompanyModal() {
    document.getElementById('companyModalTitle').textContent = 'Nouvelle Entreprise';
    document.getElementById('companyForm').reset();
    document.getElementById('companyId').value = '';
    document.getElementById('companyModal').classList.add('active');
}

async function editCompany(id) {
    try {
        const data = await apiCall(API_ENDPOINTS.companies.getById(id));
        const company = data.data;

        document.getElementById('companyModalTitle').textContent = 'Modifier l\'Entreprise';
        document.getElementById('companyId').value = company.id;
        document.getElementById('companyName').value = company.name;
        document.getElementById('companyDescription').value = company.description || '';
        document.getElementById('companyWebsite').value = company.website || '';
        document.getElementById('companyLocation').value = company.location || '';

        document.getElementById('companyModal').classList.add('active');
    } catch (error) {
        showNotification('Erreur lors du chargement de l\'entreprise', 'error');
    }
}

async function saveCompany(event) {
    event.preventDefault();

    const id = document.getElementById('companyId').value;
    const companyData = {
        name: document.getElementById('companyName').value,
        description: document.getElementById('companyDescription').value,
        website: document.getElementById('companyWebsite').value,
        logo_url: null,
        location: document.getElementById('companyLocation').value
    };

    try {
        if (id) {
            await apiCall(API_ENDPOINTS.companies.update(id), {
                method: 'PUT',
                body: JSON.stringify(companyData)
            });
            showNotification('Entreprise mise a jour avec succes');
        } else {
            await apiCall(API_ENDPOINTS.companies.create, {
                method: 'POST',
                body: JSON.stringify(companyData)
            });
            showNotification('Entreprise creee avec succes');
        }

        closeCompanyModal();
        loadCompanies();
        loadCompaniesForSelect();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteCompany(id) {
    if (!confirm('Etes-vous sur de vouloir supprimer cette entreprise ?')) return;

    try {
        await apiCall(API_ENDPOINTS.companies.delete(id), {
            method: 'DELETE'
        });
        showNotification('Entreprise supprimee avec succes');
        loadCompanies();
        loadCompaniesForSelect();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function closeCompanyModal() {
    document.getElementById('companyModal').classList.remove('active');
}

async function loadUsers() {
    const container = document.getElementById('usersTable');
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const data = await apiCall(API_ENDPOINTS.users.getAll);

        const roleColors = {
            admin: 'bg-purple-100 text-purple-800',
            company: 'bg-blue-100 text-blue-800',
            applicant: 'bg-green-100 text-green-800'
        };

        const roleLabels = {
            admin: 'Admin',
            company: 'Entreprise',
            applicant: 'Candidat'
        };

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(user => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${user.first_name} ${user.last_name}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.phone || 'N/A'}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}">
                                        ${roleLabels[user.role]}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(user.created_at)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="text-center py-8 text-red-600">Erreur lors du chargement</div>';
    }
}

function showCreateUserModal() {
    document.getElementById('userModalTitle').textContent = 'Nouvel Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('userPassword').required = true;
    document.getElementById('userModal').classList.add('active');
}

async function editUser(id) {
    try {
        const data = await apiCall(API_ENDPOINTS.users.getById(id));
        const user = data.data;

        document.getElementById('userModalTitle').textContent = 'Modifier l\'Utilisateur';
        document.getElementById('userId').value = user.id;
        document.getElementById('userFirstName').value = user.first_name;
        document.getElementById('userLastName').value = user.last_name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userRole').value = user.role;
        document.getElementById('passwordField').style.display = 'none';
        document.getElementById('userPassword').required = false;

        document.getElementById('userModal').classList.add('active');
    } catch (error) {
        showNotification('Erreur lors du chargement de l\'utilisateur', 'error');
    }
}

async function saveUser(event) {
    event.preventDefault();

    const id = document.getElementById('userId').value;
    const userData = {
        first_name: document.getElementById('userFirstName').value,
        last_name: document.getElementById('userLastName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        role: document.getElementById('userRole').value,
        company_id: null
    };

    if (!id) {
        userData.password = document.getElementById('userPassword').value;
    }

    try {
        if (id) {
            await apiCall(API_ENDPOINTS.users.update(id), {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            showNotification('Utilisateur mis a jour avec succes');
        } else {
            await apiCall(API_ENDPOINTS.users.create, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showNotification('Utilisateur cree avec succes');
        }

        closeUserModal();
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Etes-vous sur de vouloir supprimer cet utilisateur ?')) return;

    try {
        await apiCall(API_ENDPOINTS.users.delete(id), {
            method: 'DELETE'
        });
        showNotification('Utilisateur supprime avec succes');
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}
