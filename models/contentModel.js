
const mongoose = require('mongoose')

const contentSchema = mongoose.Schema({
   content_title: {
    type: String,
    required: [true, 'Please add content title'],
   },
   category_id: {
      type: String,
      required: [true, 'Please add category id']
   },
   content_description: {
    type: String,
    required: [true, 'Please add content description']
   }, 
   content_image: {
    type: String,
    required: [true, 'Please add content image']
   },
   file: {
    type: String,
    required: [true, 'Please add related file']
   },
}, 
{
   timestamps: true 
})

module.exports = mongoose.model('Content', contentSchema)
