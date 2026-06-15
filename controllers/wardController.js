const Ward = require('../models/wardModel');

exports.getWardsWithOccupancy = async (req, res) => {
  try {
    const wards = await Ward.getWardsWithOccupancy();
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wards stats: ' + error.message });
  }
};

exports.getBedsByWard = async (req, res) => {
  try {
    const beds = await Ward.getBedsByWard(req.params.wardId);
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve beds: ' + error.message });
  }
};

exports.updateBedOccupancy = async (req, res) => {
  try {
    const { is_occupied } = req.body;
    const updatedBed = await Ward.updateBedOccupancy(req.params.bedId, is_occupied);
    res.json(updatedBed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bed status: ' + error.message });
  }
};

exports.createWard = async (req, res) => {
  try {
    const newWard = await Ward.createWard(req.body);
    res.status(201).json(newWard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ward: ' + error.message });
  }
};

exports.addBedToWard = async (req, res) => {
  try {
    const newBed = await Ward.addBedToWard(req.params.wardId);
    res.status(201).json(newBed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bed: ' + error.message });
  }
};
