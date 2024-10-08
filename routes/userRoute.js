const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

router.route('/signup').post(
    [
        body('name').not().isEmpty().withMessage('Please Enter Your Name'),

        body('email').isEmail().withMessage('Please Enter Valid Email')
        .custom((userEmail) => {
            return User.findOne({email:userEmail}).then(user => {
                if (user) {
                    return Promise.reject('Email is already exists!');
                }
            })
        }),


        body('password').not().isEmpty().withMessage('Please Enter A Password'),

    ],
    authController.createUser);
    router.route('/teacher-register').post(authController.createTeacherRegister);
    
router.route('/login').post(authController.loginUser);
router.route('/logout').get(authController.logoutUser);
router.route('/student-dashboard').get(authMiddleware, authController.getDashboardPage);
router.route('/admin').get(authMiddleware, authController.getAdminPage);
router.route('/:id').delete(authController.deleteUser);
router.route('/signup-teacher/:id').post(authController.createTeacher);


router.route('/teacher-basvurulari').get(authController.getTestPage);

module.exports =router;