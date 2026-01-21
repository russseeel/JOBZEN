let currentJobId = null;

async function loadJobs(searchTerm = '') {
    const container = document.getElementById('jobsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noJobsMessage = document.getElementById('noJobsMessage');
    const status = document.getElementById('filterStatus')?.value || 'active';

    try {
        loadingSpinner.classList.remove('hidden');
        container.innerHTML = '';
        noJobsMessage.classList.add('hidden');

        const url = `${API_ENDPOINTS.advertisements.getAll}?status=${status}`;
        const data = await apiCall(url);

        let jobs = data.data;

        if (searchTerm) {
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        loadingSpinner.classList.add('hidden');

        if (jobs.length === 0) {
            noJobsMessage.classList.remove('hidden');
            return;
        }

        jobs.forEach(job => {
            const jobCard = createJobCard(job);
            container.appendChild(jobCard);
        });
    } catch (error) {
        loadingSpinner.classList.add('hidden');
        showNotification('Erreur lors du chargement des offres', 'error');
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card bg-white rounded-lg shadow-lg p-6 cursor-pointer';
    card.onclick = () => showJobDetails(job.id);

    const workingTimeLabels = {
        'full-time': 'Temps plein',
        'part-time': 'Temps partiel',
        'contract': 'Contrat',
        'internship': 'Stage'
    };

    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${job.title}</h3>
                <p class="text-blue-600 font-semibold mb-2">${job.company_name}</p>
            </div>
            ${job.logo_url ? `<img src="${job.logo_url}" alt="${job.company_name}" class="w-12 h-12 rounded">` : ''}
        </div>
        <p class="text-gray-600 mb-4 line-clamp-3">${job.short_description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
            ${job.location ? `<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                <i class="fas fa-map-marker-alt mr-1"></i> ${job.location}
            </span>` : ''}
            ${job.working_time ? `<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <i class="fas fa-clock mr-1"></i> ${workingTimeLabels[job.working_time] || job.working_time}
            </span>` : ''}
            ${job.wages ? `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <i class="fas fa-euro-sign mr-1"></i> ${job.wages}
            </span>` : ''}
        </div>
        <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm">
                <i class="fas fa-calendar mr-1"></i> Publie le ${formatDate(job.posted_date)}
            </span>
            <button class="text-blue-600 hover:text-blue-800 font-semibold">
                En savoir plus <i class="fas fa-arrow-right ml-1"></i>
            </button>
        </div>
    `;

    return card;
}

async function showJobDetails(jobId) {
    try {
        const data = await apiCall(API_ENDPOINTS.advertisements.getById(jobId));
        const job = data.data;
        currentJobId = jobId;

        document.getElementById('modalJobTitle').textContent = job.title;

        const workingTimeLabels = {
            'full-time': 'Temps plein',
            'part-time': 'Temps partiel',
            'contract': 'Contrat',
            'internship': 'Stage'
        };

        const content = `
            <div class="space-y-4">
                <div class="flex items-center space-x-4">
                    ${job.logo_url ? `<img src="${job.logo_url}" alt="${job.company_name}" class="w-16 h-16 rounded">` : ''}
                    <div>
                        <h3 class="text-xl font-bold text-blue-600">${job.company_name}</h3>
                        ${job.company_location ? `<p class="text-gray-600">${job.company_location}</p>` : ''}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                    ${job.location ? `
                    <div>
                        <p class="text-gray-500 text-sm">Lieu</p>
                        <p class="font-semibold"><i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>${job.location}</p>
                    </div>` : ''}
                    ${job.working_time ? `
                    <div>
                        <p class="text-gray-500 text-sm">Type de contrat</p>
                        <p class="font-semibold"><i class="fas fa-clock text-blue-600 mr-2"></i>${workingTimeLabels[job.working_time] || job.working_time}</p>
                    </div>` : ''}
                    ${job.wages ? `
                    <div>
                        <p class="text-gray-500 text-sm">Salaire</p>
                        <p class="font-semibold"><i class="fas fa-euro-sign text-green-600 mr-2"></i>${job.wages}</p>
                    </div>` : ''}
                    ${job.application_deadline ? `
                    <div>
                        <p class="text-gray-500 text-sm">Date limite</p>
                        <p class="font-semibold"><i class="fas fa-calendar text-red-600 mr-2"></i>${formatDate(job.application_deadline)}</p>
                    </div>` : ''}
                </div>

                <div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Description du poste</h4>
                    <p class="text-gray-700 whitespace-pre-line">${job.full_description}</p>
                </div>

                ${job.required_skills ? `
                <div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Competences requises</h4>
                    <div class="flex flex-wrap gap-2">
                        ${job.required_skills.split(',').map(skill =>
                            `<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">${skill.trim()}</span>`
                        ).join('')}
                    </div>
                </div>` : ''}

                ${job.benefits ? `
                <div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Avantages</h4>
                    <p class="text-gray-700">${job.benefits}</p>
                </div>` : ''}

                ${job.company_description ? `
                <div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">A propos de l'entreprise</h4>
                    <p class="text-gray-700">${job.company_description}</p>
                </div>` : ''}

                ${job.contact_email || job.contact_phone ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Contact</h4>
                    ${job.first_name ? `<p class="text-gray-700">${job.first_name} ${job.last_name}</p>` : ''}
                    ${job.contact_email ? `<p class="text-gray-700"><i class="fas fa-envelope mr-2"></i>${job.contact_email}</p>` : ''}
                    ${job.contact_phone ? `<p class="text-gray-700"><i class="fas fa-phone mr-2"></i>${job.contact_phone}</p>` : ''}
                </div>` : ''}
            </div>
        `;

        document.getElementById('modalJobContent').innerHTML = content;
        document.getElementById('jobModal').classList.add('active');
    } catch (error) {
        showNotification('Erreur lors du chargement des details', 'error');
    }
}

function closeJobModal() {
    document.getElementById('jobModal').classList.remove('active');
}

function showApplicationForm() {
    document.getElementById('jobModal').classList.remove('active');

    const user = getCurrentUser();
    const nameField = document.getElementById('applicantName');
    const emailField = document.getElementById('applicantEmail');

    if (user) {
        nameField.value = `${user.first_name} ${user.last_name}`;
        emailField.value = user.email;
        document.getElementById('applicantPhone').value = user.phone || '';
        document.getElementById('userInfoSection').style.display = 'none';
        nameField.removeAttribute('required');
        emailField.removeAttribute('required');
    } else {
        document.getElementById('userInfoSection').style.display = 'block';
        nameField.setAttribute('required', '');
        emailField.setAttribute('required', '');
    }

    document.getElementById('applicationModal').classList.add('active');
}

function closeApplicationModal() {
    document.getElementById('applicationModal').classList.remove('active');
    document.getElementById('applicationForm').reset();
    currentJobId = null;
}

async function submitApplication(event) {
    event.preventDefault();

    const user = getCurrentUser();

    const applicationData = {
        advertisement_id: currentJobId,
        applicant_name: user ? `${user.first_name} ${user.last_name}` : document.getElementById('applicantName').value,
        applicant_email: user ? user.email : document.getElementById('applicantEmail').value,
        applicant_phone: document.getElementById('applicantPhone').value,
        cover_letter: document.getElementById('coverLetter').value,
        resume_url: document.getElementById('resumeUrl').value
    };

    try {
        await apiCall(API_ENDPOINTS.applications.create, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });

        showNotification('Votre candidature a ete envoyee avec succes!');
        closeApplicationModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function searchJobs() {
    const searchTerm = document.getElementById('searchInput').value;
    loadJobs(searchTerm);
}

async function showMyApplications() {
    if (!isLoggedIn()) {
        showNotification('Veuillez vous connecter pour voir vos candidatures', 'error');
        showLoginModal();
        return;
    }

    try {
        const data = await apiCall(API_ENDPOINTS.applications.myApplications);

        if (data.count === 0) {
            showNotification('Vous n\'avez pas encore de candidatures', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto p-6">
                <div class="flex justify-between items-start mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Mes Candidatures</h2>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${data.data.map(app => {
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
                        return `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-bold text-gray-800">${app.job_title}</h3>
                                        <p class="text-gray-600">${app.company_name}</p>
                                        <p class="text-sm text-gray-500 mt-2">Postule le ${formatDate(app.applied_at)}</p>
                                    </div>
                                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${statusColors[app.status]}">
                                        ${statusLabels[app.status]}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        showNotification('Erreur lors du chargement de vos candidatures', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadJobs();

    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchJobs();
        }
    });
});
