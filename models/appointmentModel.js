const db = require('../db');

const Appointment = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization 
      FROM APPOINTMENT a
      JOIN PATIENT p ON a.patient_id = p.patient_id
      JOIN DOCTOR d ON a.doctor_id = d.doctor_id
      ORDER BY a.date DESC, a.time DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM APPOINTMENT WHERE appointment_id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    let appointment_id = data.appointment_id;
    
    // Auto-generate ID if not provided
    if (!appointment_id) {
      const [lastIdResult] = await db.query("SELECT appointment_id FROM APPOINTMENT ORDER BY CAST(SUBSTRING(appointment_id, 3) AS UNSIGNED) DESC LIMIT 1");
      if (lastIdResult.length > 0) {
        const lastNum = parseInt(lastIdResult[0].appointment_id.split('-')[1]);
        appointment_id = `A-${lastNum + 1}`;
      } else {
        appointment_id = 'A-301';
      }
    }

    await db.query(
      'INSERT INTO APPOINTMENT (appointment_id, patient_id, doctor_id, date, time, status, reason, hospital_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        appointment_id, 
        data.patient_id, 
        data.doctor_id, 
        data.date, 
        data.time, 
        data.status || 'PENDING', 
        data.reason, 
        data.hospital_name || 'Tulsi Premier Hospital'
      ]
    );
    return { appointment_id, ...data };
  },

  update: async (id, data) => {
    await db.query(
      'UPDATE APPOINTMENT SET patient_id = ?, doctor_id = ?, date = ?, time = ?, status = ?, reason = ?, hospital_name = ? WHERE appointment_id = ?',
      [
        data.patient_id, 
        data.doctor_id, 
        data.date, 
        data.time, 
        data.status, 
        data.reason, 
        data.hospital_name || 'Tulsi Premier Hospital',
        id
      ]
    );
    return { appointment_id: id, ...data };
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE APPOINTMENT SET status = ? WHERE appointment_id = ?', [status, id]);
    return { appointment_id: id, status };
  },

  delete: async (id) => {
    await db.query('DELETE FROM APPOINTMENT WHERE appointment_id = ?', [id]);
    return { appointment_id: id };
  },

  search: async (query) => {
    const [rows] = await db.query(`
      SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization 
      FROM APPOINTMENT a
      JOIN PATIENT p ON a.patient_id = p.patient_id
      JOIN DOCTOR d ON a.doctor_id = d.doctor_id
      WHERE p.name LIKE ? OR d.name LIKE ? OR d.specialization LIKE ? OR a.hospital_name LIKE ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
    return rows;
  }
};

module.exports = Appointment;
