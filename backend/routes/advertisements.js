const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { authMiddleware, companyOrAdminMiddleware } = require('../middleware/auth');

router.get('/', advertisementController.getAllAdvertisements);
router.get('/:id', advertisementController.getAdvertisementById);
router.post('/', authMiddleware, companyOrAdminMiddleware, advertisementController.createAdvertisement);
router.put('/:id', authMiddleware, companyOrAdminMiddleware, advertisementController.updateAdvertisement);
router.delete('/:id', authMiddleware, companyOrAdminMiddleware, advertisementController.deleteAdvertisement);

module.exports = router;
