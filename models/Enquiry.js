const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 100 },
  phone:   { type: String, required: true, trim: true, maxlength: 20 },
  email:   { type: String, trim: true, maxlength: 120, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  status:  { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', EnquirySchema);
