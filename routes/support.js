const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Enquiry } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// POST /api/support  — customer submits an enquiry (public)
router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ error: 'Database unavailable. Please call us directly.' });

    const { name, phone, email, message } = req.body;
    if (!name || !phone || !message)
      return res.status(400).json({ error: 'Name, phone and message are required' });

    const enquiry = await Enquiry.create({
      name:    String(name).trim().slice(0, 100),
      phone:   String(phone).trim().slice(0, 20),
      email:   String(email || '').trim().slice(0, 120),
      message: String(message).trim().slice(0, 1000),
    });

    res.status(201).json({ message: 'Enquiry received! We will contact you shortly.', id: enquiry._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/support  — admin lists all enquiries
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.json({ enquiries: [], total: 0 });

    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Enquiry.countDocuments(query),
    ]);

    res.json({ enquiries, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/support/:id  — admin updates status / adds note
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ error: 'Database unavailable' });

    const { status, adminNote } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminNote !== undefined) update.adminNote = adminNote;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/support/:id  — admin deletes an enquiry
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ error: 'Database unavailable' });
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
