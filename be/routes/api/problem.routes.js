const express=require('express');
const router=express.Router();
const problemController=require('../../controllers/problem.controller');



router.post('/',problemController.addProblem);

router.get('/',problemController.getAllProblems);

router.get('/:id',problemController.getProblemById);

router.patch('/:id',problemController.updateProblem);
// router.delete('/:id',problemController.deleteProblem);


module.exports=router;