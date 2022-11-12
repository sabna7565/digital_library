const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
const nodemailer = require("nodemailer");
const mime = require('mime-types');
const { uploadFile, deleteFile, generateUploadURL } = require('../utils/s3bucket');
const { generateFileName } = require('../utils/generateFileName');
const Admin = require('../models/adminModel')
const Category = require('../models/categoryModel')
const Content = require('../models/contentModel')
const User = require('../models/userModel')

let transporter = nodemailer.createTransport({
    // host: process.env.HOST,
    service: process.env.SERVICE,
    // port: 465,
    // secure: true,
    auth: {
      user: "sabnapv01@gmail.com",
      pass: "kwudeccihkrsruly", 
    },
    debug: false,
    logger: true
  });


//!.......................admin login and signup...................
// @desc    Create new admin
// @route   POST /api/admin
// @access  Public
const registerAdmin = (async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // check if admin exists
    const adminExists = await Admin.findOne({email})

    if(adminExists) {
        res.status(400)
        throw new Error('Admin already exists')
    }

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create admin
    const admin = await Admin.create({
        name, email, password:hashedPassword
    })

    if(admin) {
        res.status(201).json({
           _id: admin.id,
           name: admin.name,
            email: admin.email,
            isAdmin:admin.isAdmin,
            token: generateToken(admin._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid admin data')
    }
})    // secure: true,


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

// @desc    Authenticate the admin
// @route   POST /api/admin
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
    const {email, password} = req.body
 
    if(!email || !password) {
     res.status(400)
     throw new Error('Please add all fields')
    }
 
    // Check for user email
    const admin = await Admin.findOne({email})    
 
    if(admin && (await bcrypt.compare(password, admin.password))) {
     res.status(200).json({
         _id: admin.id,
         name: admin.name,
         email: admin.email,
         token: generateToken(admin._id),
     })     
    } else {
         res.status(400)
         throw new Error('Invalid credentials');
     }
 })

 // @desc    change password
// @route   GET /api/change-password/:token
// @access  Public

const changePassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { current_password, password } = req.body;  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminId = decoded.id;
    const admin = await Admin.findById(adminId);
    if (!admin) throw new Error('No record found');

   
   // Hash password
   const salt = await bcrypt.genSalt(10)
   const hashedPassword = await bcrypt.hash(password, salt)
   
   if(admin && (await bcrypt.compare(current_password, admin.password))) {
   const result = await Admin.findByIdAndUpdate({_id: adminId},{ password: hashedPassword });
     if (result) {
     res
        .status(201)
        .json({ status: 201, message: 'Your password has been updated' });
    }
    } else {
    res
      .status(401)
      .json({
        status: 401,
        message: 'your current password does not matching',
      });
  }
});

// @desc    send email Link For reset Password
// @route   POST /api/password-link
// @access  Public
const passwordLink = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    // Check for user email
    try{
    const data = await Admin.findOne({email: email});
    if (!data) {
        res
        .status(401)
        .json({ status: 401, message: 'This admin does not exist...!' });
    }
    //token generate for reset password
    const token = await jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
        expiresIn: '120s',
    });
    
    if(token) {
        const mailOptions = {
            from:"sabnapv01@gmail.com",
            to:email,
            subject:"sending email for password reset",
            text:`This Link Valid For 2 MINUTES http://localhost:3000/forgot-password/${token}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log("error", error);
                res.status(401).json({ status: 401, message: 'email not send.....', error });
            }else {
                console.log("email sent", info.response);
                res.status(201).json({ status: 201, message: 'password reset link send Successfully in Your Email' });
            }
        })
    }

} catch (error) {
    res
    .status(401)
    .json({
      status: 401,
      message: error,
    });
   }});

// @desc    verify user for forgot password time
// @route   GET /api/forgot-password/:token
// @access  Public
const verifyLink = asyncHandler(async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        res.status(201).json({ status: 201, decoded: decoded });
      }
      res.status(401).json({ status: 401, message: 'user not exist' });
    } catch (error) {
      res
        .status(401)
        .json({
          status: 401,
          message: 'Your time is expired. please generate the new link',
        });
    }
  });
 
//!.......................Category Management...................

// @desc    add category
// @route   GET /api/set-category
// @access  Public
const addCategory = asyncHandler(async (req, res) => {
  let promises = [];
  const {  category_name } = req.body
  const image = req.files.x`x `;

   // check if category exists
   const categoryExists = await Category.findOne({category_name})

   if(categoryExists) {
       res.status(400)
       throw new Error('category already exists')
   }

  const randomName = generateFileName();
  let pic = mime.extension(req.files.categoryimage.mimetype);

  promises.push(uploadFile(image.data, `${randomName}.${pic}`));

  Promise.all(promises)
  .then(async function (resp) {
      const dataValues  = await Category.create({
      category_name,
      categoryimage: `${randomName}.${pic}`
    });

    if (dataValues) {
      res.status(201).json({
        _id: dataValues.id,
        category_name: dataValues.category_name,
        categoryimage: dataValues.categoryimage,
      });
    } else {
      res.status(400);
      throw new Error('Invalid data');
    }
  })
  .catch(function (err) {
    res.send(err.stack);
  });
 
})

// @desc  Get category list
// @route  GET /api/get-category
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
// @route  GET /api/get-category
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
  
// @desc  Update category 
// @route   PUT /api/update-category
// @access Public
const editCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  // const{ category_name }=req.body;
  let promises = [];
  const image = req.files.categoryimage;
  const randomName = generateFileName();
  let pic = mime.extension(req.files.categoryimage.mimetype);

  promises.push(uploadFile(image.data, `${randomName}.${pic}`));

  const updateCotegoryData = {
    category_name: req.body.category_name,
    categoryimage: `${randomName}.${pic}`,
  }

  Promise.all(promises)
  .then(async function (resp) {
      const dataValues  = await Category.findByIdAndUpdate(categoryId, updateCotegoryData, {new: true});

      if (dataValues) {
        res.status(201).json({
          _id: dataValues.id,
          category_name: dataValues.category_name,
          categoryimage: dataValues.categoryimage,
        });
      } else {
        res.status(400);
        throw new Error('Invalid data');
      }
    })
    .catch(function (err) {
      res.send(err);
    });

  // try{
  //     const updateCategoryData = {
  //       category_name: category_name
  //     }

  //     const category = await Category.findByIdAndUpdate(categoryId, updateCategoryData, {
  //         new: true
  //     })
  //     res.status(200).json({
  //         success: true,
  //         category,          
  //     })
  // } catch (error) {
  //     res.status(400).json(error);
  // }
})

// @desc  delete a category
// @route  GET /api/delete-category
// @access Public
const deleteCategory = asyncHandler(async (req,res) =>{
  const { categoryId, imageKey } = req.body;
  try{
      const category = await Category.findById(categoryId);
      const data = await category.remove();
      console.log("llll", data)
      if (data) {
        await deletePostFiles(imageKey);
        res.status(200).json({ categoryId: data._id ,
        status: true,
        message: "category content deleted successfully" });
      }
  } catch (error) {
      res.json(error);
      throw new Error('Cannot delete category due some errors');
  }
})


//!.......................Content Management...................
// @desc    add content
// @route   GET /api/set-content
// @access  Public
const addContent = (async (req, res) => {
  let promises = [];
const { content_title, content_description, category_id } = req.body
const { data } = req.files.file;
const image = req.files.content_image;

  const randomName = generateFileName();
  let pic = mime.extension(req.files.content_image.mimetype);
  let document = mime.extension(req.files.file.mimetype);

  promises.push(uploadFile(image.data, `${randomName}.${pic}`));
  promises.push(uploadFile(data, `${randomName}.${document}`));

  Promise.all(promises)
  .then(async function (resp) {
      const dataValues  = await Content.create({
      content_title,
      category_id,
      content_description,
      content_image: `${randomName}.${pic}`,
      file: `${randomName}.${document}`,
    });

    if (dataValues) {
      res.status(201).json({
        _id: dataValues.id,
        content_title: dataValues.content_title,
        category_id: dataValues.category_id,
        content_description: dataValues.content_description,
        content_image: dataValues.content_image,
        file: dataValues.file,
      });
    } else {
      res.status(400);
      throw new Error('Invalid data');
    }
  })
  .catch(function (err) {
    res.send(err.stack);
  });
})

// @desc    get all contents
// @route   GET /api/get-contents
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
// @route  GET /api/get-content
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

// @desc  Update content 
// @route   PUT /api/update-content
// @access Public
const editContent = asyncHandler(async (req, res) => {
  const contentId = req.params.id;
  // const { content_title, content_description } = req.body
  let promises = [];
  const { data } = req.files.file;
  const image = req.files.content_image;

  const randomName = generateFileName();
  let pic = mime.extension(req.files.content_image.mimetype);
  let document = mime.extension(req.files.file.mimetype);

  promises.push(uploadFile(image.data, `${randomName}.${pic}`));
  promises.push(uploadFile(data, `${randomName}.${document}`));

   const updateContentData = {
        content_title: req.body.content_title,
        category_id: req.body.category_id,
        content_description: req.body.content_description,
        content_image: `${randomName}.${pic}`,
        file: `${randomName}.${document}`,
      }

      Promise.all(promises)
      .then(async function (resp) {
          const dataValues  = await Content.findByIdAndUpdate(contentId, updateContentData, {new: true});
    
          if (dataValues) {
            res.status(201).json({
              _id: dataValues.id,
              content_title: dataValues.content_title,
              category_id: dataValues.category_id,
              content_description: dataValues.content_description,
              content_image: dataValues.content_image,
              file: dataValues.file,
      
            });
          } else {
            res.status(400);
            throw new Error('Invalid data');
          }
        })
        .catch(function (err) {
          res.send(err);
        });
})

// @desc  delete content
// @route  GET /api/delete-content
// @access Public
const deleteContent = asyncHandler(async (req,res) =>{
  const { contentId, imageKey, fileKey } = req.body;
  try{
      const content = await Content.findById(contentId);
      const data = await content.remove();
      if (data) {
        await deletePostFiles(imageKey);
        await deletePostFiles(fileKey);
        res.status(200).json({ contentId: data._id, 
          status: true,
          message: 'content deleted successfully!',
         });
      }
    } catch (error) {
      res.json(error);
      throw new Error('Cannot delete content due some errors');
  }
})

// @desc Category based content
// @route  GET /api/get-category-content/id
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

//delete s3 files
const deletePostFiles = (file) => {
  let promises = [];
  promises.push(deleteFile(file));
  Promise.all(promises)
    .then(async function (res) {
      console.log("res", res)
      return true;
    })
    .catch(function (err) {
      return false;
    });
};

//!.......................User Management...................

// @desc    add new user
// @route   GET /api/set-user
// @access  Public
const addUser = asyncHandler(async (req, res) => {
  const { user_name, password, mobile_no, address } = req.body
  
  if(!user_name || !password || !mobile_no || !address ) {
      res.status(400)
      throw new Error('Please add all fields')
  }

  // check if user exists
  const userExists = await User.findOne({mobile_no})

  if(userExists) {
      res.status(400)
      throw new Error('User already exists')
  }

  //hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create user
  const user = await User.create({
    user_name, password:hashedPassword, mobile_no, address, 
  })

  if(user) {
      res.status(201).json({
         _id: user.id,
         user_name: user.user_name,
         password: user.password,
         mobile_no: user.mobile_no,
         address: user.address,
         token: generateToken(user._id)
      })
  } else {
      res.status(400)
      throw new Error('Invalid user data')
  }
})


// @desc    get all users
// @route   GET /api/get-users
// @access  Public
const allUsers = asyncHandler(async (req,res) =>{
  const users = await User.find({});

  if(users) {
      res.status(200).json({
        users,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch users due some errors');
  }
})


// @desc  Get Single User 
// @route  GET /api/get-user/id
// @access Public
const singleUser = asyncHandler(async (req,res) =>{
  const userId = req.params.id;

  const user = await User.findById(userId);

  if(user) {
      res.status(200).json({
        user,
      });
  } else {
      res.status(400);
      throw new Error('Cannot fetch user due some errors');
  }
})

// @desc  Update user 
// @route   PUT /api/update-user/:id
// @access Public
const editUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  try{
      const updateUserData = {
        user_name: req.body.user_name,
        password: req.body.password,
        mobile_no: req.body.mobile_no,
        address: req.body.address
      }

      const user = await User.findByIdAndUpdate(userId, updateUserData, {
          new: true
      })
      res.status(200).json({
          status: true,
          user, 
          message: 'content updated successfully'         
      })
  } catch (error) {
      res.status(400).json(error);
      throw new Error('Cannot update user data due some errors');
  }
})


// @desc  delete user
// @route  GET /api/delete-user/:id
// @access Public
const deleteUser = asyncHandler(async (req,res) =>{
  const userId = req.params.id;
  try{
      const user = await User.findById(userId);
      const data = await user.remove();
      res.status(200).json({ userId: data._id,
        status: true,
        message: 'user deeleted successfully'         
      });
  } catch (error) {
      res.json(error);
      throw new Error('Cannot delete category due some errors');
  }
})
module.exports = {registerAdmin, loginAdmin, changePassword, passwordLink, verifyLink, addCategory, allCategories, singleCategory, editCategory, deleteCategory, 
  addContent, allContent, singleContent, categoryContent, editContent, deleteContent,getS3Link, addUser, allUsers, singleUser, editUser, deleteUser,
}