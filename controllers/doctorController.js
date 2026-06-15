const Doctor = require('../models/doctorModel');

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAll();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve doctors: ' + error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.getById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve doctor: ' + error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const newDoctor = await Doctor.create(req.body);
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create doctor: ' + error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const updatedDoctor = await Doctor.update(req.params.id, req.body);
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update doctor: ' + error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.delete(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete doctor: ' + error.message });
  }
};

exports.searchDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.search(req.query.q);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
};
