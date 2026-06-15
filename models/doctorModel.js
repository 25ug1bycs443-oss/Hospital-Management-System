const db = require('../db');

const Doctor = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM DOCTOR ORDER BY CAST(SUBSTRING(doctor_id, 3) AS UNSIGNED) DESC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM DOCTOR WHERE doctor_id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    let doctor_id = data.doctor_id;
    
    // Auto-generate ID if not provided
    if (!doctor_id) {
      const [lastIdResult] = await db.query("SELECT doctor_id FROM DOCTOR ORDER BY CAST(SUBSTRING(doctor_id, 3) AS UNSIGNED) DESC LIMIT 1");
      if (lastIdResult.length > 0) {
        const lastNum = parseInt(lastIdResult[0].doctor_id.split('-')[1]);
        doctor_id = `D-${lastNum + 1}`;
      } else {
        doctor_id = 'D-201';
      }
    }

    await db.query(
      'INSERT INTO DOCTOR (doctor_id, name, specialization, experience_years) VALUES (?, ?, ?, ?)',
      [doctor_id, data.name, data.specialization, data.experience_years]
    );
    return { doctor_id, ...data };
  },

  update: async (id, data) => {
    await db.query(
      'UPDATE DOCTOR SET name = ?, specialization = ?, experience_years = ? WHERE doctor_id = ?',
      [data.name, data.specialization, data.experience_years, id]
    );
    return { doctor_id: id, ...data };
  },

  delete: async (id) => {
    await db.query('DELETE FROM DOCTOR WHERE doctor_id = ?', [id]);
    return { doctor_id: id };
  },

  search: async (query) => {
    const [rows] = await db.query(
      'SELECT * FROM DOCTOR WHERE name LIKE ? OR specialization LIKE ? OR doctor_id LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }
};

module.exports = Doctor;
