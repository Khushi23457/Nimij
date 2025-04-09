const express=require('express');
const router=express.Router();
const ownerloggedin=require('../middlewares/ownerloggedin')
const {loginOwner,logout}=require('../controllers/authController');
const ownerModel = require('../models/owner-model');
const {updateOrderStatus,getOwnerOrders}=require('../controllers/orderController')
const {getAllProducts,getProductForEdit}=require('../controllers/productController')

if(process.env.NODE_ENV==="development"){
    router.post("/create",async function(req,res){
        
        let owner=await ownerModel.find();
        if(owner.length>0){
          return res.status(503).send("Yoc can not create new owner");  
        }
        let {fullname,email,password}=req.body;
        let createdowner=await ownerModel.create({
           fullname,
           email,
           password
        });
        res.status(200).send(createdowner);
    });
}

router.get("/admin", ownerloggedin,function(req,res){
    let success=req.flash('success');
    let loggedin=true;
    res.render("createproducts",{user:null,success,loggedin});
})
router.get('/orders', ownerloggedin, getOwnerOrders);
router.post('/update/:orderid', ownerloggedin, updateOrderStatus);
router.get("/products", ownerloggedin, getAllProducts);
router.get('/products/edit/:productid', ownerloggedin, getProductForEdit);

router.post("/login",loginOwner)
router.post("/logout",logout);   

module.exports=router;