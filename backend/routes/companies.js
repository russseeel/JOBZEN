const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', authMiddleware, adminMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, adminMiddleware, companyController.updateCompany);
router.delete('/:id', authMiddleware, adminMiddleware, companyController.deleteCompany);

module.exports = router;
