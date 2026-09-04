const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Review, Product } = require('../models');

// GET /api/reviews/:productId  — fetch all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.json({ reviews: [], avgRating: 0, total: 0 });

    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50);

    const total = reviews.length;
    const avgRating = total > 0
      ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1))
      : 0;

    res.json({ reviews, avgRating, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reviews/:productId  — submit a new review
router.post('/:productId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ error: 'Database unavailable' });

    const { name, rating, comment } = req.body;
    if (!name || !rating) return res.status(400).json({ error: 'Name and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });

    const review = await Review.create({
      productId: req.params.productId,
      name: String(name).trim().slice(0, 80),
      rating: parseInt(rating),
      comment: String(comment || '').trim().slice(0, 500),
    });

    // Update product's average rating
    const allReviews = await Review.find({ productId: req.params.productId });
    const avg = parseFloat((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1));
    await Product.findByIdAndUpdate(req.params.productId, { rating: avg });

    res.status(201).json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/reviews/:id  — admin can delete a review
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1)
      return res.status(503).json({ error: 'Database unavailable' });
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
