# Job Board

Application web de gestion d'offres d'emploi avec interface candidat, entreprise et administrateur.

## Technologies

- **Backend** : Node.js, Express.js, MySQL
- **Frontend** : HTML, CSS (Tailwind), JavaScript
- **Authentification** : JWT (JSON Web Tokens)

## Installation

### Prerequisites

- Node.js 18+
- MySQL 8+

### Base de donnees

```bash
mysql -u root -p < database/schema.sql
```

### Backend

```bash
cd backend
cp .env.example .env  # Configurer les variables d'environnement
npm install
```

## Lancement

Depuis le dossier `backend` :

```bash
# Lancer le backend ET le frontend en même temps
npm run dev

# Ou séparément :
npm run dev:backend   # pour le lance le Backend uniquement (API sur port 3000)
npm run dev:frontend  # pour le lance le Frontend uniquement (port 8080)


npm start # pour le lance en Production
```

Le frontend sera accessible sur `http://localhost:8080` et l'API sur `http://localhost:3000`.


## Structure du projet

```
job-board/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── advertisementController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── advertisements.js
│   │   ├── applications.js
│   │   ├── auth.js
│   │   ├── companies.js
│   │   └── users.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── js/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── company.js
│   │   ├── config.js
│   │   └── main.js
│   ├── index.html
│   ├── admin.html
│   └── company.html
└── database/
    └── schema.sql
```

## API Endpoints

### Authentification

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/profile | Profil utilisateur |

### Annonces

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/advertisements | Liste des annonces |
| GET | /api/advertisements/:id | Detail d'une annonce |
| POST | /api/advertisements | Creer une annonce |
| PUT | /api/advertisements/:id | Modifier une annonce |
| DELETE | /api/advertisements/:id | Supprimer une annonce |

### Candidatures

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/applications | Postuler |
| GET | /api/applications | Liste des candidatures |
| GET | /api/applications/my-applications | Mes candidatures |
| PUT | /api/applications/:id/status | Changer le statut |

### Entreprises

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/companies | Liste des entreprises |
| POST | /api/companies | Creer une entreprise |
| PUT | /api/companies/:id | Modifier une entreprise |
| DELETE | /api/companies/:id | Supprimer une entreprise |

## Roles utilisateurs

| Role | Acces |
|------|-------|
| **applicant** | Consulter les offres, postuler, voir ses candidatures |
| **company** | Gerer ses propres annonces, voir les candidatures recues |
| **admin** | Acces complet a toutes les fonctionnalites |

## Comptes de test

| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@jobboard.com | admin123 | Admin |
| contact@techcorp.com | admin123 | Entreprise |
| hr@innovatelab.com | admin123 | Entreprise |

## Fonctionnalites

### Candidats
- Recherche d'offres d'emploi
- Filtrage par statut
- Consultation des details
- Candidature en ligne
- Suivi des candidatures

### Entreprises
- Tableau de bord dedie
- Creation et gestion des offres
- Reception des candidatures
- Gestion des statuts (en attente, examinee, acceptee, rejetee)

### Administrateurs
- Gestion complete des annonces
- Gestion des entreprises
- Gestion des utilisateurs
- Suivi de toutes les candidatures

## Securite

- Mots de passe hashes avec bcrypt
- Authentification JWT
- Requetes SQL preparees (protection injection SQL)
- Validation des donnees cote serveur
- Verification des permissions par role
