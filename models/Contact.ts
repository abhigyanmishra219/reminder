import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },

  // === New Fields for Sidebar Upload Grouping ===
  uploadId: {
    type: String,
    required: true,
    index: true,           // Important for fast filtering
  },
  uploadName: {
    type: String,
    default: 'Excel Upload',
    trim: true,
  },

  // Existing Fields
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,        // Format: DD-MM-YYYY
  },
  time: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true,        // Automatically adds createdAt & updatedAt
});

// Compound Index for better query performance
ContactSchema.index({ userId: 1, uploadId: 1 });
ContactSchema.index({ userId: 1, date: 1 });

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export default Contact;