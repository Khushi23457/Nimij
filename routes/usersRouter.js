const express=require('express');
const router=express.Router();
const {registerUser,loginUser}=require('../controllers/authController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const {getUserOrders,placeOrder,cancelOrder}=require('../controllers/orderController')
const {getUserAddresses,addAddress,getAddressForEdit,updateAddress,deleteAddress}=require('../controllers/addressController')
router.get("/",function(req,res){
    res.render('index', );
})
router.post("/register",registerUser);
router.post("/login",loginUser);   
router.get('/address/:id', isLoggedIn, getUserAddresses);
router.get('/myorders/:id', isLoggedIn, getUserOrders);
router.get('/place-order/:addressid', isLoggedIn, placeOrder);
router.post('/add-address', isLoggedIn, addAddress);
router.post('/cancel-order/:orderid', isLoggedIn, cancelOrder);
router.get('/editAddress/:addressid', isLoggedIn, getAddressForEdit);
router.post('/editAddress/:addressid', isLoggedIn, updateAddress);
router.get('/deleteAddress/:addressid', isLoggedIn, deleteAddress);
module.exports=router;