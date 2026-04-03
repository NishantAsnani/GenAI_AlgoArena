const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String },
  tags: [{ type: String }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order_index: { type: Number, default: 0 },
  is_published: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Module', moduleSchema);