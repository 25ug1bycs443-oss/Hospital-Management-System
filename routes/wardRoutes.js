const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');

router.get('/occupancy', wardController.getWardsWithOccupancy);
router.get('/:wardId/beds', wardController.getBedsByWard);
router.patch('/beds/:bedId', wardController.updateBedOccupancy);
router.post('/', wardController.createWard);
router.post('/:wardId/beds', wardController.addBedToWard);

module.exports = router;
