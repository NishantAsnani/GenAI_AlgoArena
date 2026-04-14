const express=require('express');
const router=express.Router()
const userRoutes=require('./api/user.routes');
const moduleRoutes=require('./api/module.routes')

router.use('/user',userRoutes)
router.use('/module',moduleRoutes)

router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

module.exports=router