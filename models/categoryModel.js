const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    category_name: {
    type: String,
    required: [true, 'Please add category'],
    unique: true
   },
   categoryimage: {
      type: String,
      required: [true, 'Please add category image']
   },  
}, 
{
   timestamps: true 
})

module.exports = mongoose.model('Category', categorySchema)