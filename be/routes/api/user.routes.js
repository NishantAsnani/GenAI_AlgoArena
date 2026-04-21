const express=require('express');
const router=express.Router()
const authControllers=require('../../controllers/auth.controller')
const userControllers=require('../../controllers/user.controller')
const auth=require('../../middleware/auth')
const multer=require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/',auth,userControllers.getAllUsers)

router.get('/generateUrl',authControllers.generateRedirectUrl)

router.get('/googleAuthUrl',authControllers.handleGoogleCallback)

router.get('/profile/:id',auth,userControllers.getUserProfile)

router.get('/:id',auth,userControllers.getUserById)

router.post('/login',authControllers.Login)

router.post('/signup',upload.single('avatar_url'),authControllers.Signup)

router.patch('/:id',auth,userControllers.editUser)

router.patch('/profile/:id',auth,userControllers.editUserProfile)

router.delete('/:id',auth,userControllers.deleteUser)



module.exports=router
