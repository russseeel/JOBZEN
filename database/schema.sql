DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS advertisements;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE people (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'company', 'applicant') DEFAULT 'applicant',
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE advertisements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT NOT NULL,
    company_id INT NOT NULL,
    contact_person_id INT,
    wages VARCHAR(100),
    location VARCHAR(255),
    working_time ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    contract_type VARCHAR(50),
    required_skills TEXT,
    benefits TEXT,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    posted_date DATE NOT NULL,
    application_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_person_id) REFERENCES people(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_company (company_id)
);

CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    advertisement_id INT NOT NULL,
    applicant_id INT,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    cover_letter TEXT,
    resume_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES people(id) ON DELETE SET NULL,
    INDEX idx_advertisement (advertisement_id),
    INDEX idx_applicant (applicant_id),
    INDEX idx_status (status)
);

INSERT INTO companies (name, description, website, location) VALUES
('TechCorp Solutions', 'Leading technology solutions provider', 'https://techcorp.example.com', 'Paris, France'),
('InnovateLab', 'Innovation and research company', 'https://innovatelab.example.com', 'Lyon, France'),
('Digital Agency Pro', 'Full-service digital agency', 'https://digitalagency.example.com', 'Marseille, France');

INSERT INTO people (email, password_hash, first_name, last_name, phone, role, company_id) VALUES
('admin@jobboard.com', '$2b$10$aIQ5Gi1FlXhEHqG64EcyDOcZcwymkiWGpSm6Xpjf8edd0H.Mh7j/u', 'Admin', 'User', '+33123456789', 'admin', NULL),
('contact@techcorp.com', '$2b$10$aIQ5Gi1FlXhEHqG64EcyDOcZcwymkiWGpSm6Xpjf8edd0H.Mh7j/u', 'Marie', 'Dupont', '+33123456790', 'company', 1),
('hr@innovatelab.com', '$2b$10$aIQ5Gi1FlXhEHqG64EcyDOcZcwymkiWGpSm6Xpjf8edd0H.Mh7j/u', 'Jean', 'Martin', '+33123456791', 'company', 2)
('brawn@gmail.com', '$2b$10$aIQ5Gi1FlXhEHqG64EcyDOcZcwymkiWGpSm6Xpjf8edd0H.Mh7j/u', 'Brawn', 'Harrison', '+33666666663', 'company', 3);;

INSERT INTO advertisements (title, short_description, full_description, company_id, contact_person_id, wages, location, working_time, contract_type, required_skills, benefits, posted_date, application_deadline) VALUES
('Developpeur Full Stack JavaScript',
 'Rejoignez notre equipe pour developper des applications web innovantes',
 'Nous recherchons un developpeur Full Stack passionne avec une experience en Node.js et React. Vous travaillerez sur des projets varies et stimulants dans un environnement agile. Responsabilites: developpement de nouvelles fonctionnalites, maintenance du code existant, participation aux revues de code.',
 1, 2, '40000-55000 EUR/an', 'Paris, France', 'full-time', 'CDI',
 'JavaScript, Node.js, React, MongoDB, Git',
 'Teletravail partiel, tickets restaurant, mutuelle',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),

('Designer UX/UI Senior',
 'Creez des experiences utilisateur exceptionnelles',
 'Notre agence cherche un Designer UX/UI senior pour concevoir des interfaces intuitives et esthetiques. Vous collaborerez avec les developpeurs et les clients pour creer des solutions digitales innovantes. Maitrise de Figma indispensable.',
 3, NULL, '45000-60000 EUR/an', 'Marseille, France', 'full-time', 'CDI',
 'Figma, Adobe XD, UI/UX Design, Prototypage, Design System',
 'Formation continue, RTT, prime annuelle',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY)),

('Data Scientist',
 'Exploitez le potentiel des donnees pour innover',
 'Rejoignez notre equipe R&D pour developper des modeles de machine learning et analyser des donnees complexes. Vous participerez a des projets de recherche appliquee et contribuerez a nos solutions d\'IA.',
 2, 3, '50000-70000 EUR/an', 'Lyon, France', 'full-time', 'CDI',
 'Python, Machine Learning, TensorFlow, SQL, Statistics',
 'Environnement de recherche, publications, conferences',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),

('Stage Developpement Web',
 'Apprenez et grandissez avec notre equipe',
 'Stage de 6 mois pour etudiant en informatique. Vous participerez au developpement de nos applications web et mobiles sous la supervision de developpeurs experimentes. Gratification stage + tickets restaurant.',
 1, 2, '600 EUR/mois', 'Paris, France', 'internship', 'Stage',
 'HTML, CSS, JavaScript, Bases en React',
 'Gratification, tickets restaurant, mentorat',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 20 DAY));
