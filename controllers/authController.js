const userModel=require('../models/user-model');
const ownerModel=require('../models/owner-model')
const bcrypt=require('bcrypt')
const {generateToken}=require('../utils/generateToken')
const {generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail} = require('../utils/emailService');

module.exports.registerUser= async function(req,res){
    try{
        let {email,fullname,password}=req.body;
        let user=await userModel.findOne({email});
        if(user){
            req.flash("error","Already have an account");
            return res.redirect("/");
        }
        
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        
        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(password,salt,async function (err,hash){
               if(err)
                return res.send(err.message);
               else{
                let createduser= await userModel.create({
                    fullname,
                    email,
                    password:hash,
                    emailVerificationToken: verificationToken,
                    emailVerificationExpires: verificationExpires
                })
                
                try {
                    await sendVerificationEmail(email, fullname, verificationToken);
                    req.flash("success", "Registration successful! Please check your email to verify your account.");
                    return res.redirect("/");
                } catch (emailError) {
                    console.error('Email sending failed:', emailError);
                    req.flash("error", "Account created but verification email failed to send. Please try logging in.");
                    return res.redirect("/");
                }
               }
                
            })
        })
       
    }
    catch(err){
       res.send(err.message);
    }
}

module.exports.verifyEmail = async function(req, res) {
    try {
        const { token } = req.params;
        const user = await userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash("error", "Invalid or expired verification token");
            return res.redirect("/");
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        req.flash("success", "Email verified successfully! You can now login.");
        res.redirect("/");
    } catch (err) {
        req.flash("error", "Verification failed");
        res.redirect("/");
    }
}

module.exports.loginUser=async function(req,res){
    try{
       let {email,password}=req.body;
       let user=await userModel.findOne({email}); 
       if(!user){
        req.flash("error","Wrong Email or Password");
       return res.redirect("/");
       }
       
       if (!user.isEmailVerified) {
           req.flash("error", "Please verify your email before logging in. Check your inbox.");
           return res.redirect("/");
       }
       
       bcrypt.compare(password,user.password,function(err,result){
          if(result){
            let token=generateToken(user);
            res.cookie("token",token);
            res.redirect("/shop");
          }
          else{
            req.flash("error","Wrong Email or Password");
            return res.redirect("/");
          }
        })
    }
    catch(err){
        res.send(err.message);
     }
}

module.exports.forgotPassword = async function(req, res) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            req.flash("error", "No account found with that email address");
            return res.redirect("/updatepassword");
        }

        const resetToken = generateVerificationToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); 

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        try {
            await sendPasswordResetEmail(email, user.fullname, resetToken);
            req.flash("success", "Password reset link sent to your email");
            res.redirect("/updatepassword");
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            req.flash("error", "Failed to send reset email. Please try again.");
            res.redirect("/updatepassword");
        }
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/updatepassword");
    }
}

module.exports.resetPassword = async function(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash("error", "Invalid or expired reset token");
            return res.redirect("/updatepassword");
        }

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) throw err;
                
                user.password = hash;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();

                req.flash("success", "Password updated successfully! You can now login.");
                res.redirect("/");
            });
        });
    } catch (err) {
        req.flash("error", "Password reset failed");
        res.redirect("/updatepassword");
    }
}

module.exports.logout=async function(req,res){
    res.cookie("token","");
    res.redirect("/");
};

module.exports.loginOwner=async function(req,res){
    try{
        let {email,password}=req.body;
        if(email===process.env.OWNER_EMAIL){
            let owner= await ownerModel.findOne({email});
            if(!owner){
                req.flash("error","Wrong Email or Password");
               return res.redirect("/ownerlogin");
               }
               bcrypt.compare(password,owner.password,function(err,result){
                  if(result){
                    let token=generateToken(owner);
                    res.cookie("token",token);
                    res.redirect("/owners/admin");
                  }
                  else{
                    req.flash("error","Wrong Email or Password");
                    return res.redirect("/ownerlogin");
                  }
                })
            }
        }
        catch(err){
            res.send(err.message);
         }
    }