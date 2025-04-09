const userModel=require('../models/user-model');
const ownerModel=require('../models/owner-model')
const bcrypt=require('bcrypt')
const {generateToken}=require('../utils/generateToken')

module.exports.registerUser= async function(req,res){
    try{
        let {email,fullname,password}=req.body;
        let user=await userModel.findOne({email});
        if(user){
            req.flash("error","Already have an account");
            return res.redirect("/");
        }
        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(password,salt,async function (err,hash){
               if(err)
                return res.send(err.message);
               else{
                let createduser= await userModel.create({
                    fullname,
                    email,
                    password:hash
                })
                let token=generateToken(createduser);
                res.cookie("token",token);
                res.redirect("/shop");
               }
                
            })
        })
       
    }
    catch(err){
       res.send(err.message);
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
