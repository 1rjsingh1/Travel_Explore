const express = require('express');
const UserController = require('../Controllers/userControllers');
const authController = require('../Controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updatepassword', authController.updatePassword);

router.get('/me', UserController.getMe, UserController.getUser);
router.patch(
  '/updateMe',
  UserController.uploadUserPhoto,
  UserController.resizeUserImage,
  UserController.updateMe
);
router.delete('/deleteMe', UserController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = router;
