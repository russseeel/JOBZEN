document.addEventListener('DOMContentLoaded', () => {
    if (!checkCompanyAccess()) return;

    const user = getCurrentUser();
    document.getElementById('companyName').textContent = `${user.first_name} ${user.last_name}`;

    loadAdvertisements();
});

function checkCompanyAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }

    const user = getCurrentUser();
    if (user.role !== 'company') {
        showNotification('Acces refuse. Compte entreprise requis.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }

    return true;
}

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
    }
}

async function loadAdvertisements() {
    const container = document.getElementById('advertisementsTable');
    const user = getCurrentUser();

    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const data = await apiCall(`${API_ENDPOINTS.advertisements.getAll}?company_id=${user.company_id}&status=all`);

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

        if (data.data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-bullhorn text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600 text-xl">Aucune annonce pour le moment</p>
                    <button onclick="showCreateAdModal()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Creer votre premiere annonce
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(ad => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900">${ad.title}</div>
                                    <div class="text-sm text-gray-500">${ad.short_description.substring(0, 60)}...</div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500">${ad.location || 'N/A'}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">${formatDate(ad.posted_date)}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ad.status]}">
                                        ${statusLabels[ad.status]}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right text-sm font-medium">
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
    const user = getCurrentUser();

    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>';

    try {
        const status = document.getElementById('filterApplicationStatus')?.value || '';
        let url = `${API_ENDPOINTS.applications.getAll}?company_id=${user.company_id}`;
        if (status) url += `&status=${status}`;

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

        if (data.data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600 text-xl">Aucune candidature recue</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.data.map(app => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900">${app.applicant_name}</div>
                                    <div class="text-sm text-gray-500">${app.applicant_email}</div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">${app.job_title}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">${formatDate(app.applied_at)}</td>
                                <td class="px-6 py-4">
                                    <select onchange="updateApplicationStatus(${app.id}, this.value)" class="px-2 py-1 text-xs rounded-full border ${statusColors[app.status]}">
                                        ${Object.keys(statusLabels).map(s =>
                                            `<option value="${s}" ${s === app.status ? 'selected' : ''}>${statusLabels[s]}</option>`
                                        ).join('')}
                                    </select>
                                </td>
                                <td class="px-6 py-4 text-right text-sm font-medium">
                                    <button onclick="viewApplication(${app.id})" class="text-blue-600 hover:text-blue-900">
                                        <i class="fas fa-eye"></i> Voir
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
                        <p class="text-lg">${app.applicant_name}</p>
                        <p class="text-gray-600"><i class="fas fa-envelope mr-2"></i>${app.applicant_email}</p>
                        ${app.applicant_phone ? `<p class="text-gray-600"><i class="fas fa-phone mr-2"></i>${app.applicant_phone}</p>` : ''}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Poste</h3>
                        <p>${app.job_title}</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Lettre de motivation</h3>
                        <p class="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">${app.cover_letter || 'Aucune lettre fournie'}</p>
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
