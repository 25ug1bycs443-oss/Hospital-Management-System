const db = require('../db');

const Patient = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM PATIENT ORDER BY CAST(SUBSTRING(patient_id, 3) AS UNSIGNED) DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM PATIENT WHERE patient_id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    let patient_id = data.patient_id;
    
    // Auto-generate ID if not provided
    if (!patient_id) {
      const [lastIdResult] = await db.query("SELECT patient_id FROM PATIENT ORDER BY CAST(SUBSTRING(patient_id, 3) AS UNSIGNED) DESC LIMIT 1");
      if (lastIdResult.length > 0) {
        const lastNum = parseInt(lastIdResult[0].patient_id.split('-')[1]);
        patient_id = `P-${lastNum + 1}`;
      } else {
        patient_id = 'P-101';
      }
    }

    await db.query(
      'INSERT INTO PATIENT (patient_id, name, age, gender, contact, blood_group, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, data.name, data.age, data.gender, data.contact, data.blood_group, data.registration_date || new Date()]
    );
    return { patient_id, ...data };
  },

  update: async (id, data) => {
    await db.query(
      'UPDATE PATIENT SET name = ?, age = ?, gender = ?, contact = ?, blood_group = ? WHERE patient_id = ?',
      [data.name, data.age, data.gender, data.contact, data.blood_group, id]
    );
    return { patient_id: id, ...data };
  },

  delete: async (id) => {
    await db.query('DELETE FROM PATIENT WHERE patient_id = ?', [id]);
    return { patient_id: id };
  },

  search: async (query) => {
    const [rows] = await db.query(
      'SELECT * FROM PATIENT WHERE name LIKE ? OR patient_id LIKE ? OR contact LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
};

module.exports = Patient;
