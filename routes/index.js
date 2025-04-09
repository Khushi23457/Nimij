const express=require('express');
const router=express.Router();
const isloggedin=require('../middlewares/isLoggedIn')
const productModel=require('../models/product-model')
const {logout}=require('../controllers/authController')
const {showCart,addToCart,increaseQuantity,decreaseQuantity}=require('../controllers/cartController')


router.get("/",function(req,res){
    let error=req.flash('error')
    let loggedin=false;
    res.render("index" ,{error,loggedin,user:null});
});
router.get("/cart/:id", isloggedin, showCart);
router.get("/addtocart/:productid", isloggedin, addToCart);
router.get("/increase-quantity/:productid", isloggedin, increaseQuantity);
router.get("/decrease-quantity/:productid", isloggedin, decreaseQuantity);

router.get("/logout",logout);

router.get("/shop",isloggedin, async function(req,res){
    const Sortby=req.query.Sortby|| 'Popular';
    const collection=req.query.collection
    const discount=req.query.discount==='true'
    const available=req.query.available==='true'
    let loggedin=true;
    let query={}
    let products;
    let selectedopt={}

    if(collection==='new'){
        const oneMonthAgo=new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth()-1)
        query.createdAt={$gte:oneMonthAgo}
    }
    if(discount){
        query.discount = { $gt: 0 };
    }
    if(available){
       query.available=true
    }

    if(Sortby==='Newest'){
        selectedopt={createdAt:-1}
    }else{
        selectedopt={cartcount:-1,createdAt:-1}
    }
    products=await productModel.find(query).sort(selectedopt);
    let success=req.flash('success');
    res.render("shop",{products ,success ,user:req.user,Sortby,collection,discount,available,loggedin});
})
router.get("/ownerlogin", async function(req,res){
    let loggedin=false;
    let error=req.flash('error')
    res.render("ownerlogin",{loggedin,error});
})
router.get("/orders/:id", async function(req,res){
    let loggedin=false;
    let error=req.flash('error')
    res.render("orders",{loggedin,error});
})


module.exports=router;