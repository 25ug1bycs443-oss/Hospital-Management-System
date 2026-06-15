const Dashboard = require('../models/dashboardModel');

exports.getStats = async (req, res) => {
  try {
    const stats = await Dashboard.getStats();
    const recentAppointments = await Dashboard.getRecentAppointments();
    const recentBills = await Dashboard.getRecentBills();
    
    res.json({
      ...stats,
      recentAppointments,
      recentBills
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats: ' + error.message });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const patientGrowth = await Dashboard.getPatientGrowth();
    const departmentStats = await Dashboard.getDepartmentStats();
    const revenueAnalytics = await Dashboard.getRevenueAnalytics();
    const bedOccupancy = await Dashboard.getBedOccupancy();
    
    res.json({
      patientGrowth,
      departmentStats,
      revenueAnalytics,
      bedOccupancy
    });
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    res.status(500).json({ error: 'Failed to retrieve charts analytics: ' + error.message });
  }
};
