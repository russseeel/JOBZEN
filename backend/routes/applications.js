const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware, optionalAuthMiddleware, adminMiddleware, companyOrAdminMiddleware } = require('../middleware/auth');

router.post('/', optionalAuthMiddleware, applicationController.createApplication);
router.get('/my-applications', authMiddleware, applicationController.getMyApplications);
router.get('/', authMiddleware, companyOrAdminMiddleware, applicationController.getAllApplications);
router.get('/:id', authMiddleware, companyOrAdminMiddleware, applicationController.getApplicationById);
router.put('/:id/status', authMiddleware, companyOrAdminMiddleware, applicationController.updateApplicationStatus);
router.delete('/:id', authMiddleware, adminMiddleware, applicationController.deleteApplication);

module.exports = router;
