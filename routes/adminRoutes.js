const express = require('express')
const router = express.Router()

const { registerAdmin, loginAdmin, changePassword, verifyLink,  passwordLink, addCategory, allCategories, singleCategory, deleteCategory, editCategory,
addContent, allContent, singleContent, categoryContent, editContent, deleteContent,getS3Link, addUser, singleUser, allUsers, editUser, deleteUser,
} = require('../controllers/adminController')

const { isAdmin}  = require('../middleware/authMiddleware')

router.route("/").post(registerAdmin)
router.post("/admin", loginAdmin)
router.put('/change-password/:token', isAdmin, changePassword)
router.post('/password-link',passwordLink)
router.get('/forgot-password/:token',verifyLink)

router.post('/set-category', isAdmin, addCategory)
router.get('/get-categories', isAdmin, allCategories);
router.get('/get-category/:id', isAdmin, singleCategory);
router.put('/update-category/:id', isAdmin, editCategory)
router.delete('/delete-category', isAdmin, deleteCategory)

router.post('/set-content', isAdmin, addContent)
router.get('/get-contents', isAdmin, allContent)
router.get('/get-content/:id', isAdmin, singleContent)
router.get('/get-category-content/:id', isAdmin, categoryContent)
router.put('/update-content/:id', isAdmin, editContent)
router.delete('/delete-content', isAdmin, deleteContent)
router.get('/get-s3link', getS3Link);

router.post('/set-user', isAdmin, addUser)
router.get('/get-users', isAdmin, allUsers)
router.get('/get-user/:id', isAdmin, singleUser)
router.put('/update-user/:id', isAdmin, editUser)
router.delete('/delete-user/:id', isAdmin, deleteUser)


module.exports= router;