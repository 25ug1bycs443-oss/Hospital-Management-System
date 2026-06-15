const db = require('../db');

const Ward = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM WARD ORDER BY ward_id ASC');
    return rows;
  },

  getWardsWithOccupancy: async () => {
    const [rows] = await db.query(`
      SELECT w.*, 
             (SELECT COUNT(*) FROM BED b WHERE b.ward_id = w.ward_id) AS total_beds,
             (SELECT COUNT(*) FROM BED b WHERE b.ward_id = w.ward_id AND b.is_occupied = TRUE) AS occupied_beds
      FROM WARD w
      ORDER BY w.ward_id ASC
    `);
    return rows;
  },

  getBedsByWard: async (wardId) => {
    const [rows] = await db.query('SELECT * FROM BED WHERE ward_id = ? ORDER BY bed_id ASC', [wardId]);
    return rows;
  },

  getAllBeds: async () => {
    const [rows] = await db.query('SELECT * FROM BED ORDER BY bed_id ASC');
    return rows;
  },

  updateBedOccupancy: async (bedId, isOccupied) => {
    await db.query('UPDATE BED SET is_occupied = ? WHERE bed_id = ?', [isOccupied, bedId]);
    return { bed_id: bedId, is_occupied: isOccupied };
  },

  createWard: async (data) => {
    let ward_id = data.ward_id;
    if (!ward_id) {
      const [lastIdResult] = await db.query("SELECT ward_id FROM WARD ORDER BY CAST(SUBSTRING(ward_id, 3) AS UNSIGNED) DESC LIMIT 1");
      if (lastIdResult.length > 0) {
        const lastNum = parseInt(lastIdResult[0].ward_id.split('-')[1]);
        ward_id = `W-${String(lastNum + 1).padStart(2, '0')}`;
      } else {
        ward_id = 'W-01';
      }
    }

    await db.query(
      'INSERT INTO WARD (ward_id, name, capacity, floor) VALUES (?, ?, ?, ?)',
      [ward_id, data.name, data.capacity, data.floor]
    );

    // Automatically generate beds for this ward based on capacity
    for (let i = 1; i <= data.capacity; i++) {
      // Find the last bed number in the database to increment safely
      const [lastBedResult] = await db.query("SELECT bed_id FROM BED ORDER BY CAST(SUBSTRING(bed_id, 3) AS UNSIGNED) DESC LIMIT 1");
      let nextBedId = 'B-1';
      if (lastBedResult.length > 0) {
        const lastBedNum = parseInt(lastBedResult[0].bed_id.split('-')[1]);
        nextBedId = `B-${lastBedNum + 1}`;
      }
      await db.query('INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES (?, ?, FALSE)', [nextBedId, ward_id]);
    }

    return { ward_id, ...data };
  },

  addBedToWard: async (wardId) => {
    // Increment capacity of ward
    await db.query('UPDATE WARD SET capacity = capacity + 1 WHERE ward_id = ?', [wardId]);
    
    // Find next bed_id
    const [lastBedResult] = await db.query("SELECT bed_id FROM BED ORDER BY CAST(SUBSTRING(bed_id, 3) AS UNSIGNED) DESC LIMIT 1");
    let nextBedId = 'B-1';
    if (lastBedResult.length > 0) {
      const lastBedNum = parseInt(lastBedResult[0].bed_id.split('-')[1]);
      nextBedId = `B-${lastBedNum + 1}`;
    }
    
    await db.query('INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES (?, ?, FALSE)', [nextBedId, wardId]);
    return { bed_id: nextBedId, ward_id: wardId, is_occupied: false };
  }
};

module.exports = Ward;
