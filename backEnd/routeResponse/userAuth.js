const UserModel = require("../dataBase/User");
require("../dataBase/conf");
// const { findOne } = require('./dataBase/User');
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const secretKey = process.env.SECRET_KEY
const crypto = require("crypto");
const sendEmail = require("../utils/sentEmail");
const User = require("../dataBase/User");
const Token = require("../dataBase/Token");
const sendToken = require("../utils/jwtToken");
const { use } = require("../routes/ProductRoute");
const app = express();
app.use(cookieParser());
exports.register = async (req, res) => {
    // console.log(req.body)
    try {
        const { email, name, phone, password } = req.body;
        // console.log('email', req.body)
        let checkUser = await UserModel.findOne({ email });
        // console.log(checkUser)
        if (checkUser) {
            return res.status(409).json({
                status: "failed",
                message: "Email id exist",
            });
        }
        // console.log(password)
        // const newUser = new UserModel(req.body)
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({
                    status: "failed",
                    message: err.message,
                });
            }
            let newUser = await UserModel.create({
                email,
                name,
                phone,
                password: hash,
                ProfilePic: {
                    public_id: "User Profile Id",
                    url: "profileUrl",
                },
            });
            newUser = newUser.toObject();
            // console.log(newUser)

            delete newUser.password;
            // console.log(newUser)
            // if (result) {
                const token = jwt.sign(
                    {
                        exp: Math.floor(Date.now() / 1000) + 60 * 60*7,
                        data: newUser._id,
                    },
                    secretKey
                );
                //   console.log(token)
                return res
                    .status(200)
                    .cookie("token", token, {
                        // expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        maxAge: 60*60 * 1000,
                        httpOnly: true,
                    })
                    .json({
                        // status: "success",
                        // name: loginData.name,
                        // role:loginData.role,
                        status: "success",
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                        token,
                    });

            // return res.status(200).json({
            //     status: "success",
            //     name: newUser.name,
            //     email: newUser.email,
            //     role: newUser.role
            // });
        });

        // const result = await newUser.save()
        // // console.log(result)
        // res.status(200).json({
        //     status: "success",
        //     result
        // })
    } catch (e) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};
exports.login = async (req, res) => {
    try {
        // res.cookie('cookie', 'jffjfjfjhfjhfjfjhfjhfjhfjhfjhfj')
        // console.log(secretKey, 'secret-key')
    
        // console.log(process.env.MONGO_DB_PORT, 'Mongo-Db-Port')

        const { email, password } = req.body;
        // console.log(password)
        let loginData = await UserModel.findOne({ email });
        // console.log(loginData)
        if (loginData) {
            // console.log(loginData.password)
            // console.log(password)
            // Password Check
            await bcrypt.compare(password, loginData.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: err.message,
                    });
                }
                if (result) {   
                    const token = jwt.sign(
                        {
                            exp: Math.floor(Date.now() / 1000) + 60 * 60*7,
                            data: loginData._id,
                        },
                        secretKey
                    );
                    //   console.log(token)
                    return res
                        .status(200)
                        .cookie("token", token, {
                            // expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            maxAge: 60*60 * 1000,
                            httpOnly: true,
                        })
                        .json({
                            status: "success",
                            email:loginData.email,
                            phone:loginData.phone,
                            name: loginData.name,
                            role:loginData.role,
                            createdAt:loginData.createdAt,
                            token,
                        });
                }
                else {
                    return res.status(400).json({
                        status: "Failed",
                        message: "Invalid credentails",
                    });
                }
            });
        } else {
            return res.status(400).json({
                status: "failed",
                message: "User doesn't exist",
            });
        }
    } catch (e) {
        res.status(404).json({
            status: "failed",
            message: e.message,
        });
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.status(200).cookie("token", null, {
                expires: new Date(Date.now()),
                maxAge:0*1000,
                httpOnly: true,
            })
            .json({
                status: "success",
                message: "Logged out!",
            });
    } catch (e) {
        res.status(400).json({
            status: "failed",
            message: e.message,
        });
    }
};

// Generating token for Password Reset....

const resetTokengen = () => {
    // generating token
    const newToken = crypto.randomBytes(20).toString("hex");

    /// Hashing
    const resetHashToken = crypto
        .createHash("sha256")
        .update(newToken)
        .digest("hex");
    const expireTime = Date.now() + 5 * 60 * 1000;
    return newToken;
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const testData = resetTokengen();
    console.log(testData);
    // console.log(email)
    const user = await UserModel.findOne({ email });
    // console.log(user);
    if (!user) {
        return res.status(404).json({
            status: "Failed",
            message: "User Not Found",
        });
    }
    // Get restToken
    // console.log("running");

    const restToken = user.getresetPassordtoken();
    // console.log(restToken);
    await user.save({ validateBeforeSave: false });
    // const resetPasswordLink = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${restToken}`;
    // const resetPasswordLink = `http://localhost:3000/password/reset/${restToken}`
    const resetPasswordLink = `${req.protocol}://${req.get("host")}/password/reset/${restToken}`

    // console.log(resetPasswordLink)
    const message = `your reset Password Link is :- \n\n ${resetPasswordLink}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "FunHub password Recovery",
            message,
        });
        res.status(200).json({
            success: "success",
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(400).json({
            status: "failed",
            message: err.message,
        });
    }

};


// Reset Password
exports.resetPassword = async (req, res, next) => {
    // console.log(req.params.token, 'token-backend')

    // creating hash token
    const resetPasswordToeknHash = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await UserModel.findOne({
        resetPasswordToeknHash,
        resetPasswordExpire: { $gt: Date.now() }

    })

    if (!user) {
        return res.status(404).json({
            status: "Failed",
            message: "Reset password link has been expired.",
        });
    }

    // check confirmPassword and password
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(404).json({
            status: "Failed",
            message: "Password does not match.",
        });

    }
    // console.log('user=>', user.password)
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save()

    // return res.status(200).json({
    //     status: "success",    
    //     message: "your password has been changed successfully"
    // })
    sendToken(user, 200, res)


}

// user--Details

exports.userDeatils = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id)
        res.status(200).json({
            status: "success",
            user,
            name:user.name,
            role:user.role,
            email:user.email,
            phone:user.phone,
            createdAt:user.createdAt,

        })
    }
    catch (e) {
        res.status(400).json({
            status: "failed",
            message: e.message
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        console.log(req.body)
        const user = await UserModel.findById(req.user.id);
        if (user) {
            await bcrypt.compare(req.body.oldPassword, user.password, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: err.message,
                    });
                }
                if (result) {
                    user.password = await bcrypt.hash(req.body.newPassword, 10);
                    await user.save()
                    sendToken(user, 200, res) 

                    //   console.log(token)

                }
                else {
                    return res.status(400).json({
                        status: "Failed",
                        message: "Incorrect old Password",
                    });
                }
            });

            if (req.body.newPassword !== req.body.confirmPassword) {
                return res.status(400).json({
                    status: 'failed', 
                    message: "Please enter same password!"
                })
            }
        }

    }
    catch (e) {
        res.status(400).json({
            status: 'failed',
            message: e.message
        })
    }

}


// Admin see All users
exports.allUsers = async (req, res) => {
    try {
        const users = await UserModel.find()
        // console.log("running")

        res.status(200).json({
            status: "success",
            users,
        })
    }
    catch (e) {
        res.status(400).json({
            status: "failed",
            message: e.message
        })
    }

}

// Admin Get User details..



exports.userDetails = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        res.status(200).json({
            status: "success",
            user
        })
    }
    catch (e) {
        res.status(400).json({
            status: 'failed',
            message: e.message
        })
    }

}


// change Role user To Admin AND vice - versa

exports.updateRole = async (req, res) => {
    try {
        // const userData = {
        //     name: req.body.name,
        //     email: req.body.email,
        //     phone:req.body.phone,
        //     role: req.body.role
        // }
        console.log(req.body, req.body.role, 'req')

        // const user = await UserModel.findByIdAndUpdate(req.user.id, userData,{upsert:true})
        const user = await UserModel.findById(req.params.id)
        user.role = req.body.role
        user.name = req.body.name
        user.email = req.body.email
        user.phone = req.body.phone
        await user.save({validateBeforeSave:false})
        res.status(200).json({
            status: 'success',
            // user
        })
        // const user = await 
    }
    catch (e) {
        res.status(400).json({
            status: 'failed',
            message: e.message
        })
    }
}

// Admin delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "user does not exist with requested Id"
            })
        }
        await user.remove()
        res.status(200).json({
            status: 'success',
            message:"User deleted successfully!"
        })
    }catch(e){
        res.status(400).json({
            status: 'failed',
            message: e.message
        })
    }

}

