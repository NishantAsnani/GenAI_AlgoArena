const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description_md: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags: [{ type: String }],
  supported_languages: [{ type: String }],
  constraints: { type: Object },
  test_cases: [{ type: Object }], 
  hints: [{ type: Object }],
  solution_meta: { type: Object },
  isSolved: { type: Boolean, default: false },  
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);