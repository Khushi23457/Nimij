const userModel = require('../models/user-model');
const productModel = require('../models/product-model');

exports.showCart = async (req, res) => {
    try {
      await req.user.populate("cart.product");
      res.render("cart", { user: req.user });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/shop");
    }
  };

exports.addToCart = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.email });
      const productId = req.params.productid;
      const cartIndex = user.cart.findIndex(item => item.product.toString() === productId);
      
      const product = await productModel.findById(productId);
      product.cartcount += 1;
      await product.save();
      
      if (cartIndex >= 0) {
        user.cart[cartIndex].quantity += 1;
      } else {
        user.cart.push({
          product: productId,
          quantity: 1
        });
      }
      
      await user.save();
      req.flash("success", "Added to cart");
      res.redirect("/shop");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/shop");
    }
  };
exports.increaseQuantity = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const cartIndex = user.cart.findIndex(item => item.product.toString() === req.params.productid);
    
    if (cartIndex >= 0) {
      user.cart[cartIndex].quantity += 1;
      await user.save();
    }
    
    res.redirect('/cart/' + user.id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/shop');
  }
};  
exports.decreaseQuantity = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.user.email });
      const cartIndex = user.cart.findIndex(item => item.product.toString() === req.params.productid);
      
      if (cartIndex >= 0) {
        if (user.cart[cartIndex].quantity > 1) {
          user.cart[cartIndex].quantity -= 1;
        } else {
          user.cart.splice(cartIndex, 1);
        }
        
        await user.save();
      }
      
      res.redirect('/cart/' + user.id);
    } catch (err) {
      req.flash("error", err.message);
      res.redirect('/shop');
    }
  };