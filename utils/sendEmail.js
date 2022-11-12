const nodemailer = require("nodemailer");
const asyncHandler = require('express-async-handler')
const sendEmail= asyncHandler(async(email, subject, text)=>{
    try {
    let transporter = nodemailer.createTransport({
        host: process.env.HOST,
        service: process.env.SERVICE,
        port: 465,
        secure: true,
        auth: {
          user: process.env.USER,
          pass: process.env.PASSWORD, 
        },
        debug: false,
        logger: true
      });

      await transporter.sendMail({
        from: process.env.USER,
        to: email,
        subject: subject,
        html: text,
      });
      return true;
    } catch (error) {
        console.log(error);
        return false;
      }
})

module.exports = sendEmail;