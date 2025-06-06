const express=require('express');
const router=express.Router();
const {registerUser,loginUser,verifyEmail,forgotPassword,resetPassword}=require('../controllers/authController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const {getUserOrders,placeOrder,cancelOrder}=require('../controllers/orderController')
const {getUserAddresses,addAddress,getAddressForEdit,updateAddress,deleteAddress}=require('../controllers/addressController')

router.get("/",function(req,res){
    res.render('index', );
})
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", function(req, res) {
    res.render('reset-password', { 
        token: req.params.token, 
        error: req.flash('error'),
        success: req.flash('success'),
        user: null,
        loggedin: false 
    });
});
router.post("/reset-password/:token", resetPassword);
router.get('/address/:id', isLoggedIn, getUserAddresses);
router.get('/myorders/:id', isLoggedIn, getUserOrders);
router.get('/place-order/:addressid', isLoggedIn, placeOrder);
router.post('/add-address', isLoggedIn, addAddress);
router.post('/cancel-order/:orderid', isLoggedIn, cancelOrder);
router.get('/editAddress/:addressid', isLoggedIn, getAddressForEdit);
router.post('/editAddress/:addressid', isLoggedIn, updateAddress);
router.get('/deleteAddress/:addressid', isLoggedIn, deleteAddress);
module.exports=router;