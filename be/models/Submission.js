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



submissionSchema.post('save', async function(doc) {
    // 1. Only run this heavy logic if the submission was actually Accepted
    console.log(`Updating progress for submission ${doc._id}`);
    if (doc.status !== 'Completed') {
        return; 
    }
    

    try {

        const Progress = mongoose.models.Progress || require('./Progress');
        const Problem = mongoose.models.Problem || require('./Problem');
        const Lesson = mongoose.models.Lesson || require('./Lesson');

        // 2. Fetch or create the user's progress record
        let progress = await Progress.findOne({ user_id: doc.user_id });
        if (!progress) {
            progress = new Progress({ user_id: doc.user_id });
        }

        // 3. IDEMPOTENCY CHECK: If already solved, update activity but don't recount
        if (progress.solved_problems.includes(doc.problem_id)) {
            progress.last_activity = Date.now();
            await progress.save();
            return; 
        }

        // 4. Update core problem progress
        progress.solved_problems.push(doc.problem_id);
        progress.last_activity = Date.now();

        // ==========================================
        // 5. CHECK LESSON COMPLETION
        // ==========================================
        const totalProblemsInLesson = await Problem.countDocuments({ lesson_id: doc.lesson_id });
        
        // Count how many of this user's solved_problems belong to this specific lesson
        const solvedInLesson = await Problem.countDocuments({
            _id: { $in: progress.solved_problems },
            lesson_id: doc.lesson_id
        });

        if (solvedInLesson === totalProblemsInLesson) {
            // Lesson finished!
            if (!progress.completed_lessons.includes(doc.lesson_id)) {
                progress.completed_lessons.push(doc.lesson_id);

                // ==========================================
                // 6. CHECK MODULE COMPLETION
                // (Only runs if a lesson was just completed)
                // ==========================================
                const totalLessonsInModule = await Lesson.countDocuments({ module_id: doc.module_id });
                
                // Count how many of this user's completed_lessons belong to this specific module
                const solvedLessonsInModule = await Lesson.countDocuments({
                    _id: { $in: progress.completed_lessons },
                    module_id: doc.module_id
                });

                if (solvedLessonsInModule === totalLessonsInModule) {
                    // Module finished!
                    if (!progress.completed_modules.includes(doc.module_id)) {
                        progress.completed_modules.push(doc.module_id);
                    }
                }
            }
        }


        await progress.save();
        console.log(`✅ Progress updated for user ${doc.user_id}`);

    } catch (err) {
        console.error("❌ Error in Submission post-save hook updating progress:", err);
    }
});





module.exports = mongoose.model('Submission', submissionSchema);