const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  session_type: { type: String },
  messages: [{ type: Object }], // Store chat history
  complexity_analysis: { type: Object },
  debug_report: { type: Object },
  tokens_used: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiSession', aiSessionSchema);