const Appointment = require('../models/appointmentModel');

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve appointments: ' + error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.getById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve appointment: ' + error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const newAppointment = await Appointment.create(req.body);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment: ' + error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.update(req.params.id, req.body);
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment: ' + error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const result = await Appointment.updateStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment status: ' + error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.delete(req.params.id);
    res.json({ message: 'Appointment cancelled/deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment: ' + error.message });
  }
};

exports.searchAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.search(req.query.q);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
};
