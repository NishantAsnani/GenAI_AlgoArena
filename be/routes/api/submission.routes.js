const express=require('express');
const router=express.Router();
const submissionController=require('../../controllers/submission.controller');
const auth=require('../../middleware/auth');



// router.get('/:token',submissionController.getSubmissionResult);

router.post('/',auth,submissionController.addSubmission);




module.exports=router;