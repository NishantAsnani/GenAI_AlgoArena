const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  completed_lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  solved_problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  xp_earned: { type: Number, default: 0 },
  streak_days: { type: Number, default: 0 },
  status: { type: String, default: 'in_progress' },
  last_activity: { type: Date, default: Date.now }
});

// Ensure a user only has one progress record per module
progressSchema.index({ user_id: 1, module_id: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);