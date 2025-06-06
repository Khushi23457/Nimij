const express=require('express');
const router=express.Router();
const isloggedin=require('../middlewares/isLoggedIn')
const productModel=require('../models/product-model')
const {logout}=require('../controllers/authController')
const {showCart,addToCart,increaseQuantity,decreaseQuantity}=require('../controllers/cartController')


router.get("/",function(req,res){
    let error=req.flash('error')
    let success=req.flash('success')
    let loggedin=false;
    res.render("index" ,{error,success,loggedin,user:null});
});
router.get("/cart/:id", isloggedin, showCart);
router.get("/addtocart/:productid", isloggedin, addToCart);
router.get("/increase-quantity/:productid", isloggedin, increaseQuantity);
router.get("/decrease-quantity/:productid", isloggedin, decreaseQuantity);
router.get('/updatepassword',function (req, res){
    res.render('updatepassword', {
        error:req.flash('error'),
        success:req.flash('success'),
        user:null,
        loggedin: false
    });
});
router.get("/logout",logout);

router.get("/shop", isloggedin, async function(req, res) {
    try {
        const { q, Sortby = 'Popular', collection, discount, available } = req.query;
        let loggedin = true;
        let query = {};
        let products;
        let selectedopt = {};

        if (q && q.trim() !== '') {
            const searchitem = q.trim();
            
            const searchWords = searchitem.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            
            const wordRegexArray = searchWords.map(word => ({
                $or: [
                    { name: { $regex: word, $options: 'i' } },
                    { description: { $regex: word, $options: 'i' } }
                ]
            }));
            
            if (wordRegexArray.length > 0) {
                query.$or = wordRegexArray.reduce((acc, curr) => {
                    return acc.concat(curr.$or);
                }, []);
            }
            
            searchWords.forEach(word => {
                if (!isNaN(parseFloat(word))) {
                    query.$or.push({ discount: { $eq: parseFloat(word) } });
                }
            });
        }

        if (collection === 'new') {
            const oneMonthAgo = new Date()
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
            query.createdAt = { $gte: oneMonthAgo }
        }

        if (discount === 'true') {
            query.discount = { $gt: 0 };
        }

        if (available === 'true') {
            query.available = true
        }

        if (Sortby === 'Newest') {
            selectedopt = { createdAt: -1 }
        } else {
            selectedopt = { cartcount: -1, createdAt: -1 }
        }

        products = await productModel.find(query).sort(selectedopt);
        let success = req.flash('success');

        res.render("shop", {
            currentPage: 'shop',
            products,
            success,
            user: req.user,
            Sortby,
            collection: collection || null,
            discount: discount === 'true',
            available: available === 'true',
            loggedin,
            searchQuery: q || '',
            req: req
        });
    } catch (err) {
        req.flash("error", "Failed to fetch products");
        res.redirect("/shop");
    }
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