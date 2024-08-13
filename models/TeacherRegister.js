const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherRegisterSchema = new Schema({
    createAt: {
        type: Date,
        default: Date.now,
      },

      name:{
        type: String,
        required: true,
    },
    
    email: {
        type: String,
        required: true,
        
    },
    subject: {
        type: String,
        required: true,
        
    },
    experience: {
        type: String,
        required: true,
        
    },
    
    onayladi: {
        type: Boolean,
        
    },

    });

    
 

const TeacherRegister = mongoose.model('TeacherRegister', TeacherRegisterSchema);
module.exports = TeacherRegister;