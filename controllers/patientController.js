const Patient = require('../models/patientModel');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.getAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve patients: ' + error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.getById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve patient: ' + error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const newPatient = await Patient.create(req.body);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient: ' + error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updatedPatient = await Patient.update(req.params.id, req.body);
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient: ' + error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await Patient.delete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient: ' + error.message });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const patients = await Patient.search(req.query.q);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
};
