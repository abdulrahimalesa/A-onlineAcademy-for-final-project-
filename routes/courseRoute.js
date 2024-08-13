const express = require('express');
const courseController = require('../controllers/coursController');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.route('/').post( courseController.createCourse);
router.route('/').get(courseController.getAllCourses);
router.route('/test').get(courseController.getAllCoursesForHomePage);
router.route('/teacher-dashboard').get(courseController.getAllCourses1);
router.route('/teacher-courses/:slug').get(courseController.getTeacherCourse);
router.route('/:slug').get(courseController.getCourse);
router.route('/get/:slug').get(courseController.getCourseGet);
router.route('/video/:slug').get(courseController.getVideo);
router.route('/teacher-video/:slug').get(courseController.getTeacherVideo);
router.route('/:slug').delete(courseController.deleteCourse);
router.route('/:slug').put(courseController.updateCourse);
router.route('/enroll').post(courseController.enrollCourse);
router.route('/release').post(courseController.releaseCourse);



module.exports =router;