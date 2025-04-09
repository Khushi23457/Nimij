const express=require('express');
const router=express.Router();
const upload=require('../config/multer-config');
const ownerloggedin = require('../middlewares/ownerloggedin');
const {createProduct,updateProduct}=require('../controllers/productController')

router.post("/create", upload.single("image"),createProduct);
router.post('/update/:productid',ownerloggedin,upload.single("image"),updateProduct)

module.exports=router;