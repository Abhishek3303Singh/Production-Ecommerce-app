const nodemailer = require('nodemailer')
const sendEmail = async (options)=>{    
    // console.log(options.email)
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port: 465,
        service:'gmail',
        auth:{
            user:"funnnhub@gmail.com",
            pass:"ojzrfkfrsiqybuyg"
        }
        
    })
    const mailOptions = {
        from:"funnnhub@gmail.com",
        to:options.email,
        text:options.message
    }
    await transporter.sendMail(mailOptions)
}
module.exports = sendEmail