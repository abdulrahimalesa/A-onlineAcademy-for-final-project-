const Cours = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

exports.createCourse = async (req, res) => {

  try {
    const existingDocument = await Cours.findOne({ _id: req.params.id });
    if (existingDocument) {
      existingDocument.onayladi = true ; // Yeni alanı ve değerini ekleyin
      await existingDocument.save(); // Güncelleme işlemini kaydedin
    } else {
      console.log('Belge bulunamadı.'); // Belge bulunamazsa bir hata mesajı gösterilebilir
    }

    const uploadDir = 'public/uploadsimage';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    console.log(req.files);

    if (!req.files || !req.files.images) {
      return res.status(400).send("No files uploaded");
    }

    let files = req.files.images;
    if (!Array.isArray(files)) {
      files = [files]; // Tek dosyayı bir diziye dönüştür
    }

    // Dosya yükleme işlemlerini dizi olarak saklayacak bir Promise dizisi
    const uploadPromises = files.map((file) => {
      const uploadPath = `${uploadDir}/${file.name}`;

      return new Promise((resolve, reject) => {
        file.mv(uploadPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(`/uploadsimage/${file.name}`);
          }
        });
      });
    });

    // Tüm dosyaların yüklendiğinden emin olmak için Promise'ların tamamlanmasını bekleyin
    const imagePaths = await Promise.all(uploadPromises);


    const uploadDirVideos = 'public/uploadsvideo';
    if (!fs.existsSync(uploadDirVideos)) {
      fs.mkdirSync(uploadDirVideos);
    } 

    if (!req.files || !req.files.videos) {
      return res.status(400).send("No videos uploaded");
    }
    
    let videoFiles = req.files.videos;
    if (!Array.isArray(videoFiles)) {
      videoFiles = [videoFiles]; // Tek dosyayı bir diziye dönüştür
    }
    
    const uploadPromisesVideos = videoFiles.map((videoFile) => {
      const uploadPathVideo = `${uploadDirVideos}/${videoFile.name}`;
    
      return new Promise((resolve, reject) => {
        videoFile.mv(uploadPathVideo, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(`/uploadsvideo/${videoFile.name}`);
          }
        });
      });
    });

    const videoPaths = await Promise.all(uploadPromisesVideos);
    const videoTitles = req.body.videoTitles;


    // Tüm dosyalar yüklendiyse, veritabanına kaydedin
    const course = await Cours.create({
      name: req.body.name,
      description: req.body.description,
      images: imagePaths,
      videos: videoPaths, // Videoları ekleme
      videoTitles: videoTitles, // Video başlıklarını da ekleyin
      category: req.body.category,
      user: req.session.userID
    });
    

    req.flash("success", `${course.name} has been create successfuly`);
    res.status(201).redirect('/courses/teacher-dashboard')
  } catch (error) {
    console.error("Bir hata oluştu:", error); // Hatanın konsola loglanması
    if (error.code === 11000) {
      // MongoDB'de unique kısıtlamalarına takılan bir hata varsa
      req.flash("error", "Bu isimde bir kurs zaten mevcut");
    } else {
      req.flash("error", "Dosya yükleme veya veritabanı işlemleri sırasında bir hata oluştu");
    }
    res.status(500).redirect('/courses'); // Genel bir sunucu hatası durumu için 500 koduyla yönlendirme
  }
};




exports.getAllCourses = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);

    const categorySlug = req.query.categories;
    const query = req.query.search;

    const category  = await Category.findOne({slug:categorySlug});

    let filter = {};

    if(categorySlug){
      filter = {category:category._id}
    }
    if (query) {
      filter = {name:query}
    }
    if (!query && ! categorySlug) {
      filter.name = "",
      filter.category = null
    }

    const courses = await Cours.find({
      $or:[
        {name: {$regex: '.*' + filter.name + '.*', $options: 'i'}},
        {category: filter.category}
        
      ]
    }).sort('-createAt').populate('user');
    const categories = await Category.find();

    res.status(200).render('student-allcourses', {
      courses,
      categories,
      user,
      page_name: 'courses',
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};


exports.getAllCoursesForHomePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);

    const categorySlug = req.query.categories;
    const query = req.query.search;

    const category  = await Category.findOne({slug:categorySlug});

    let filter = {};

    if(categorySlug){
      filter = {category:category._id}
    }
    if (query) {
      filter = {name:query}
    }
    if (!query && ! categorySlug) {
      filter.name = "",
      filter.category = null
    }

    const courses = await Cours.find({
      $or:[
        {name: {$regex: '.*' + filter.name + '.*', $options: 'i'}},
        {category: filter.category}
        
      ]
    }).sort('-createAt').populate('user');
    const categories = await Category.find();

    res.status(200).render('courses', {
      courses,
      categories,
      user,
      page_name: 'courses',
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};





exports.getAllCourses1 = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);

    const categorySlug = req.query.categories;
    const query = req.query.search;

    const category  = await Category.findOne({slug:categorySlug});

    let filter = {};

    if(categorySlug){
      filter = {category:category._id}
    }
    if (query) {
      filter = {name:query}
    }
    if (!query && ! categorySlug) {
      filter.name = "",
      filter.category = null
    }

    const courses = await Cours.find({
      user:req.session.userID,
      $or:[
        {name: {$regex: '.*' + filter.name + '.*', $options: 'i'}},
        {category: filter.category}
        
      ]
    }).sort('-createAt').populate('user');
    const categories = await Category.find();

    res.status(200).render('teacher-dashboard', {
      courses,
      categories,
      user,
      page_name: 'courses',
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Cours.findOne({ slug: req.params.slug }).populate('user');
    const categories  = await Category.find();
    res.status(200).render('student-courses', {
      course,
      page_name: 'student-courses',
      user,
      categories,
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};


exports.getTeacherCourse = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Cours.findOne({ slug: req.params.slug }).populate('user');
    const categories  = await Category.find();
    res.status(200).render('teacher-courses', {
      course,
      page_name: 'teacher-courses',
      user,
      categories,
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};


exports.getVideo = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Cours.findOne({ slug: req.params.slug }).populate('user');
    const categories  = await Category.find();
    res.status(200).render('student-video', {
      course,
      page_name: 'student-video',
      user,
      categories,
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.getTeacherVideo = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    const course = await Cours.findOne({ slug: req.params.slug }).populate('user');
    const categories  = await Category.find();
    res.status(200).render('teacher-video', {
      course,
      page_name: 'teacher-video',
      user,
      categories,
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.getCourseGet = async (req, res) => {
  try {
    const user = await User.findById(req.session.userID);
    
    const course = await Cours.findOne({ slug: req.params.slug }).populate('user');
    const categories  = await Category.find();
    res.status(200).render('student-get-courses', {
      course,
      page_name: 'student-get-courses',
      user,
      categories,
    });
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {



    const user = await User.findById(req.session.userID);
    await user.courses.push({_id:req.body.course_id});

    const existingDocument = await Cours.findById({_id:req.body.course_id});
    if (existingDocument) {
      existingDocument.onayladi = true ; // Yeni alanı ve değerini ekleyin
      await existingDocument.save(); // Güncelleme işlemini kaydedin
    } else {
      console.log('Belge bulunamadı.'); // Belge bulunamazsa bir hata mesajı gösterilebilir
    }
    await user.save();
    res.status(200).redirect('/users/student-dashboard')
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.releaseCourse = async (req, res) => {
  try {

    const user = await User.findById(req.session.userID);
    await user.courses.pull({_id:req.body.course_id});

    const existingDocument = await Cours.findById({_id:req.body.course_id});
    if (existingDocument) {
      existingDocument.onayladi = false ; // Yeni alanı ve değerini ekleyin
      await existingDocument.save(); // Güncelleme işlemini kaydedin
    } else {
      console.log('Belge bulunamadı.'); // Belge bulunamazsa bir hata mesajı gösterilebilir
    }

    await user.save();
    res.status(200).redirect('/users/student-dashboard')
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};


exports.deleteCourse = async (req, res) => {
  try {

    const course = await Cours.findOneAndRemove({slug:req.params.slug})
    req.flash("error", `${course.name} has been removed successfuly`);
    res.status(200).redirect('/courses/teacher-dashboard');
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {

    const course = await Cours.findOne({slug: req.params.slug});
    course.name = req.body.name;
    course.description = req.body.description;
    course.category = req.body.category;
    console.log('category',req.body.category);

         // Check if new images are uploaded
    if (req.files && req.files.images) {
      const uploadDir = 'public/uploadsimage';

      // Process and save new image
      const newImage = req.files.images;
      const uploadPath = `${uploadDir}/${newImage.name}`;

      // Save the new image, overwrite the existing one
      await newImage.mv(uploadPath);
      course.images = `/uploadsimage/${newImage.name}`;
    }


    // Check if new videos are uploaded
    if (req.files && req.files.videos) {
      const uploadDirVideos = 'public/uploadsvideo';

      // Process and save new videos
      let newVideos = req.files.videos;

      // If there's only one file, convert it to an array
      if (!Array.isArray(newVideos)) {
        newVideos = [newVideos];
      }

      const uploadedVideoPaths = [];

      // Process each new video file
      for (let i = 0; i < newVideos.length; i++) {
        const videoFile = newVideos[i];
        const uploadPathVideo = `${uploadDirVideos}/${videoFile.name}`;

        // Save the new video
        await videoFile.mv(uploadPathVideo);
        uploadedVideoPaths.push(`/uploadsvideo/${videoFile.name}`);
      }

      course.videos = uploadedVideoPaths;
    }

        // Update video titles
        const updatedVideoTitles = req.body.videoTitles;

        if (Array.isArray(updatedVideoTitles)) {
          course.videoTitles = updatedVideoTitles;
        } else {
          course.videoTitles = [updatedVideoTitles];
        }

    await course.save(); // Save the updated course

    res.status(200).redirect('/courses/teacher-dashboard');
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

