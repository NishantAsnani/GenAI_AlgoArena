const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description_md: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags: [{ type: String }],
  supported_languages: [{ type: String }],
  
  // Updated: Explicit constraints for execution engines and UI
  constraints: { 
    time_limit_ms: { type: Number, default: 2000 },      // Standard 2 second timeout
    memory_limit_kb: { type: Number, default: 128000 },  // Standard 128 MB limit
    details: [{ type: String }]                          // For textual constraints like "1 <= N <= 10^5"
  },
  
  // Updated: Strict schema for test cases
  test_cases: [{ 
    input: { type: String, required: true },
    expected_output: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }], 
  
  hints: [{ type: String }], // Changed to String array if hints are just text, keeping it simpler
  solution_meta: { type: Object },
  isSolved: { type: Boolean, default: false },  
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);