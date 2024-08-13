const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;




const CourseSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    unique: true
  },
  images: {
    type: [String], // String dizisi olarak tanımlıyoruz

  },
  videos: {
    type: [String], // String dizisi olarak tanımlıyoruz

  },
  videoTitles: {
    type: [String],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  onayladi: {
    type: Boolean,
    
},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
});



CourseSchema.pre('validate', function(next){ // veritabandeki  document olusturmadan once yapicak oun
  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
  })
  next();
})

const Cours = mongoose.model('course', CourseSchema);
module.exports = Cours;
