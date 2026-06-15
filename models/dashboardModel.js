const db = require('../db');

const Dashboard = {
  getStats: async () => {
    const [patients] = await db.query('SELECT COUNT(*) AS count FROM PATIENT');
    const [doctors] = await db.query('SELECT COUNT(*) AS count FROM DOCTOR');
    const [appointments] = await db.query('SELECT COUNT(*) AS count FROM APPOINTMENT');
    const [revenue] = await db.query("SELECT IFNULL(SUM(total_amount), 0) AS revenue FROM BILL WHERE payment_status = 'PAID'");
    const [occupied] = await db.query('SELECT COUNT(*) AS count FROM BED WHERE is_occupied = TRUE');
    const [available] = await db.query('SELECT COUNT(*) AS count FROM BED WHERE is_occupied = FALSE');

    return {
      totalPatients: patients[0].count,
      totalDoctors: doctors[0].count,
      totalAppointments: appointments[0].count,
      totalRevenue: parseFloat(revenue[0].revenue).toFixed(2),
      occupiedBeds: occupied[0].count,
      availableBeds: available[0].count
    };
  },

  getRecentAppointments: async () => {
    const [rows] = await db.query(`
      SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization 
      FROM APPOINTMENT a 
      JOIN PATIENT p ON a.patient_id = p.patient_id 
      JOIN DOCTOR d ON a.doctor_id = d.doctor_id 
      ORDER BY a.date DESC LIMIT 5
    `);
    return rows;
  },

  getRecentBills: async () => {
    const [rows] = await db.query(`
      SELECT b.*, p.name AS patient_name 
      FROM BILL b 
      JOIN PATIENT p ON b.patient_id = p.patient_id 
      ORDER BY b.bill_date DESC LIMIT 5
    `);
    return rows;
  },

  getPatientGrowth: async () => {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(registration_date, '%b %Y') AS month, COUNT(*) AS count 
      FROM PATIENT 
      GROUP BY DATE_FORMAT(registration_date, '%Y-%m'), DATE_FORMAT(registration_date, '%b %Y')
      ORDER BY DATE_FORMAT(registration_date, '%Y-%m')
    `);
    return rows;
  },

  getDepartmentStats: async () => {
    const [rows] = await db.query(`
      SELECT specialization, COUNT(*) AS count 
      FROM DOCTOR 
      GROUP BY specialization
    `);
    return rows;
  },

  getRevenueAnalytics: async () => {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(bill_date, '%b %Y') AS month, SUM(total_amount) AS revenue 
      FROM BILL 
      WHERE payment_status = 'PAID'
      GROUP BY DATE_FORMAT(bill_date, '%Y-%m'), DATE_FORMAT(bill_date, '%b %Y')
      ORDER BY DATE_FORMAT(bill_date, '%Y-%m')
    `);
    return rows;
  },

  getBedOccupancy: async () => {
    const [rows] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM BED WHERE is_occupied = TRUE) AS occupied,
        (SELECT COUNT(*) FROM BED WHERE is_occupied = FALSE) AS available
    `);
    return rows[0];
  }
};

module.exports = Dashboard;
