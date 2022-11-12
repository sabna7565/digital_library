const asyncHandler = require('express-async-handler');
const { generateUploadURL } = require('../utils/s3bucket');
const Category = require('../models/categoryModel')
const Content = require('../models/contentModel')
 
//!.......................Category Management...................
// @desc  Get category list
// @route  GET /api/home/get-category
// @access Public
const allCategories = asyncHandler(async (req,res) =>{
  const category = await Category.find({});

  if(category) {
      res.status(200).json({
        category,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch category due some errors');
  }
})


// @desc  Get Single category 
// @route  GET /api/home/get-category
// @access Public
const singleCategory = asyncHandler(async (req,res) =>{
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);

  if(category) {
      res.status(200).json({
        category,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch category due some errors');
  }
})
  


//!.......................Content Management...................

// @desc    get all contents
// @route   GET /api/home/get-contents
// @access  Public
const allContent = asyncHandler(async (req,res) =>{
  const content = await Content.find({});

  if(content) {
      res.status(200).json({
        content,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch category due some errors');
  }
})

// @desc  Get Single content 
// @route  GET /api/home/get-content
// @access Public
const singleContent = asyncHandler(async (req,res) =>{
  const contentId = req.params.id;

  const content = await Content.findById(contentId);

  if(content) {
      res.status(200).json({
        content,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch content due some errors');
  }
})


// @desc Category based content
// @route  GET /api/home/get-category-content/id
// @access Public
const categoryContent = asyncHandler(async (req,res) =>{
  const categoryId = req.params.id;

  const content = await Content.find({category_id:categoryId});

  if(content) {
      res.status(200).json({
        content,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch content due some errors');
  }
})

//!------------------- get s3 link --------------------
//get s3 link
const getS3Link = asyncHandler(async (req, res) => {
  const { key } = req.body;
  const url = await getUrl(key);
  if (url) {
    res.status(200).json({
      url: url,
    });
  }
});

const getUrl = async (key) => {
  return await generateUploadURL(key);
};



module.exports = {allCategories, singleCategory, allContent, singleContent, categoryContent, getS3Link }