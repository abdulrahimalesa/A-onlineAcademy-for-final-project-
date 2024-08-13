const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const Cours = require('../models/Course');
const TeacherRegister = require('../models/TeacherRegister');

exports.createUser = async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).redirect('/login');
    } catch (error) { // Add the 'error' parameter here
     const errors = validationResult(req);

     for (let i = 0; i <errors.array().length; i++){
      req.flash("error", `${errors.array()[i].msg}`);
     }

     
     res.status(400).redirect('/register');
    }
  };


  exports.createTeacher = async (req, res) => {
    try {
      const existingDocument = await TeacherRegister.findOne({ _id: req.params.id });
      if (existingDocument) {
        existingDocument.onayladi = true ; // Yeni alanı ve değerini ekleyin
        await existingDocument.save(); // Güncelleme işlemini kaydedin
      } else {
        console.log('Belge bulunamadı.'); // Belge bulunamazsa bir hata mesajı gösterilebilir
      }
      console.log(req);

      const user = await User.create(req.body);
      res.status(201).redirect('/login');
    } catch (error) { // Add the 'error' parameter here
     const errors = validationResult(req);

     for (let i = 0; i <errors.array().length; i++){
      req.flash("error", `${errors.array()[i].msg}`);
     }

     
     res.status(400).redirect('/register');
    }
  };

  exports.createTeacherRegister = async (req, res) => {
    try{
        //  const registerBayilik = 
        await TeacherRegister.create(req.body); //database de gosterme
        req.flash("success", "Başvurunuz Gönderildi");

        // res.status(201).json({
        //     status: 'success',
        //     registerBayilik
        // });

        res.status(200).redirect('/work-with-us');
    } catch (error) {
      req.flash("error", `Bir hata oluştu!`);
        // res.status(400).json({
        //     status: 'fail',
        //     error,
            
        // });
        console.error('Error:', error);

        res.status(400).redirect('/register');
    }
};

 // kursun kodlari 
  exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //mongoose 6
    const user = await User.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, same) => {
        if (same) {


          // Kullanıcının rolünü kontrol edin
          if (user.role === 'student') {
            req.session.userID = user._id;
            res.status(200).redirect('/courses');
          } else if (user.role === 'teacher') {
            req.session.userID = user._id;
            res.status(200).redirect('/courses/teacher-dashboard'); // Kullanıcı paneline yönlendir
          } else if (user.role === 'admin') {
            req.session.userID = user._id;
            res.status(200).redirect('/users/admin'); // Kullanıcı paneline yönlendir
          }

        } else {
          req.flash('error', 'Your password is not correct!');
          res.status(400).redirect('/login');
        }
      });
    } else {
      req.flash('error', 'User is not exist!');
      res.status(400).redirect('/login');
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};
  
// benim kodum
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       // Kullanıcı bulunamazsa bir yanıt döndürün
//       return res.status(401).json({ mesaj: 'Kullanıcı bulunamadı' });
//     }

//     // bcrypt.compare'ı async/await bağlamında kullanın
//     const parolaEslesme = await bcrypt.compare(password, user.password);

//      if (parolaEslesme) {
//       req.session.userID = user._id;
//       res.status(200).redirect('/users/dashboard');
//      } 
//      else {
//       req.flash("error", `Your password is not correct!`);
//       res.status(400).redirect('/login');
//    }
//   } catch (hata) {
//     // Oluşan hataları işleyin
//     res.status(500).json({
//       durum: 'hata',
//       mesaj: 'Bir hata oluştu',
//       hata: hata.message, // Anlamlı bir hata mesajı sağlayın
//     });
//   }
// };

exports.logoutUser = (req, res) =>{
  req.session.destroy(()=> {
    res.redirect('/')
  })
}

exports.getAdminPage =  async(req, res) => {

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
  const user = await User.findOne({_id:req.session.userID}).populate('courses');
  const users = await User.find();
  res.status(200).render('admin-dashboard',{
      page_name: 'admin-dashboard',
      user,
      categories,
      courses,
      users
  });
};

exports.getDashboardPage =  async(req, res) => {

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
  const user = await User.findOne({_id:req.session.userID}).populate('courses');
  const users = await User.find();
  res.status(200).render('student-dashboard',{
      page_name: 'student-dashboard',
      user,
      categories,
      courses,
      users
  });
};


exports.deleteUser = async (req, res) => {
  try {

    await User.findByIdAndRemove(req.params.id);
    await Cours.deleteMany({user:req.params.id});

    res.status(200).redirect('/users/admin');
  } catch (error) {
    // Add the 'error' parameter here
    res.status(400).json({
      status: 'fail',
      error, // Now 'error' is defined and contains the actual error object
    });
  }
};

exports.getTestPage = async (req, res) => {
  const user = await User.findOne({_id:req.session.userID})
  const TeacherBasvurulari = await TeacherRegister.find().sort({createAt: -1 });
  res.status(200).render('test', {
      page_name: 'test',
      user,
      TeacherBasvurulari
  })
}

