const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  language_id: { type: Number, required: true },
  code: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed'] }, // e.g., Accepted, Wrong Answer
  runtime_ms: { type: Number },
  memory_kb: { type: Number },
  test_results: [{ type: Object }],
  complexity: { type: Object },
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);