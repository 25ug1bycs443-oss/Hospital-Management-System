const Bill = require('../models/billModel');

exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.getAll();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bills: ' + error.message });
  }
};

exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.getById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bill: ' + error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const newBill = await Bill.create(req.body);
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill: ' + error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const updatedBill = await Bill.update(req.params.id, req.body);
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bill: ' + error.message });
  }
};

exports.updateBillStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!payment_status) return res.status(400).json({ error: 'Payment status is required' });
    const result = await Bill.updateStatus(req.params.id, payment_status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status: ' + error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    await Bill.delete(req.params.id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bill: ' + error.message });
  }
};

exports.searchBills = async (req, res) => {
  try {
    const bills = await Bill.search(req.query.q);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
};
