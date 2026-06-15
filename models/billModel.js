const db = require('../db');

const Bill = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT b.*, p.name AS patient_name, p.contact AS patient_contact
      FROM BILL b
      JOIN PATIENT p ON b.patient_id = p.patient_id
      ORDER BY b.bill_date DESC, CAST(SUBSTRING(b.bill_id, 3) AS UNSIGNED) DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM BILL WHERE bill_id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    let bill_id = data.bill_id;
    
    // Auto-generate ID if not provided
    if (!bill_id) {
      const [lastIdResult] = await db.query("SELECT bill_id FROM BILL ORDER BY CAST(SUBSTRING(bill_id, 3) AS UNSIGNED) DESC LIMIT 1");
      if (lastIdResult.length > 0) {
        const lastNum = parseInt(lastIdResult[0].bill_id.split('-')[1]);
        bill_id = `B-${lastNum + 1}`;
      } else {
        bill_id = 'B-401';
      }
    }

    await db.query(
      'INSERT INTO BILL (bill_id, patient_id, total_amount, payment_status, bill_date) VALUES (?, ?, ?, ?, ?)',
      [bill_id, data.patient_id, data.total_amount, data.payment_status || 'UNPAID', data.bill_date || new Date()]
    );
    return { bill_id, ...data };
  },

  update: async (id, data) => {
    await db.query(
      'UPDATE BILL SET patient_id = ?, total_amount = ?, payment_status = ?, bill_date = ? WHERE bill_id = ?',
      [data.patient_id, data.total_amount, data.payment_status, data.bill_date, id]
    );
    return { bill_id: id, ...data };
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE BILL SET payment_status = ? WHERE bill_id = ?', [status, id]);
    return { bill_id: id, payment_status: status };
  },

  delete: async (id) => {
    await db.query('DELETE FROM BILL WHERE bill_id = ?', [id]);
    return { bill_id: id };
  },

  search: async (query) => {
    const [rows] = await db.query(`
      SELECT b.*, p.name AS patient_name, p.contact AS patient_contact
      FROM BILL b
      JOIN PATIENT p ON b.patient_id = p.patient_id
      WHERE p.name LIKE ? OR b.bill_id LIKE ? OR b.payment_status LIKE ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    return rows;
  }
};

module.exports = Bill;
