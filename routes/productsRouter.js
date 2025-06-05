const express=require('express');
const router=express.Router();
const upload=require('../config/multer-config');
const ownerloggedin = require('../middlewares/ownerloggedin');
const {createProduct,updateProduct,searchproduct}=require('../controllers/productController');
const isLoggedIn = require('../middlewares/isLoggedIn');

router.post("/create", ownerloggedin, upload.single("image"),createProduct);
router.post('/update/:productid',ownerloggedin,upload.single("image"),updateProduct)

module.exports=router;