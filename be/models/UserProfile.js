// models/UserProfile.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({
  // Foreign key → users collection
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,   // one profile per user
  },

  // ── Basic Info ──────────────────────────────────────────────────────────
  location:    { type: String, default: '' },
  education:   { type: String, default: '' },
  grad_year:   { type: Number, default: '' },
  mobile:      { type: String, default: '' },
  bio:         { type: String, default: '' },

  // ── Social Links ────────────────────────────────────────────────────────
  github:      { type: String, default: '' },
  linkedin:    { type: String, default: '' },
  twitter:     { type: String, default: '' },
  resume_url:  { type: String, default: '' },

  // ── Coding Platform Profiles ─────────────────────────────────────────────
  leetcode:    { type: String, default: '' },
  codeforces:  { type: String, default: '' },
  gfg:         { type: String, default: '' },
  hackerrank:  { type: String, default: '' },

}, { timestamps: true });  // adds createdAt + updatedAt automatically

module.exports = mongoose.model('UserProfile', userProfileSchema);