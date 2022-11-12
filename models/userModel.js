
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
   user_name: {
    type: String,
    required: [true, 'Please add username'],
   },
   password: {
    type: String,
    required: [true, 'Please add password']
   }, 
   mobile_no: {
    type: Number,
    required: [true, 'Please add mobile number'],
    unique: true
   },
   address: {
    type: String,
    required: [true, 'Please add address']
   },
}, 
{
   timestamps: true 
})

module.exports = mongoose.model('User', userSchema)
