const jwt=require('jsonwebtoken')
const ownerModel=require('../models/owner-model')

module.exports= async function(req,res,next){
    if(!req.cookies.token){
        req.flash("error","You need to login first");
        return res.redirect("/ownerlogin");
    }
    try{
        let decoded=jwt.verify(req.cookies.token,process.env.JWT_KEY);
        let owner=await ownerModel.findOne({email:decoded.email}).select("-password");
        next();
    }
    catch(err){
        req.flash("error","Something went wrong");
        return res.redirect("/ownerlogin");
    }
}