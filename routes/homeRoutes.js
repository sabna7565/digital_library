const express = require('express')
const router = express.Router()

const { allCategories, singleCategory, allContent, singleContent, categoryContent, getS3Link  } = require('../controllers/homeController')


router.get('/get-categories', allCategories);
router.get('/get-category/:id', singleCategory);

router.get('/get-contents', allContent)
router.get('/get-content/:id', singleContent)
router.get('/get-category-content/:id', categoryContent)
router.get('/get-s3link', getS3Link);


module.exports= router;