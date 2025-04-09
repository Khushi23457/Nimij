const productModel = require('../models/product-model');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    
    await productModel.create({
      name,
      image: req.file.buffer,
      discount,
      price,
      bgcolor,
      textcolor,
      panelcolor
    });
    
    req.flash("success", "Product created successfully");
    res.redirect("/owners/admin");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/owners/admin");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      discount: req.body.discount,
      price: req.body.price,
      textcolor: req.body.textcolor,
      panelcolor: req.body.panelcolor,
      bgcolor: req.body.bgcolor,
      available: req.body.available
    };

    if (req.file) {
      updates.image = req.file.buffer;
    }
    
    await productModel.findByIdAndUpdate(req.params.productid, updates);
    req.flash("success", "Product updated successfully");
    res.redirect("/owners/products");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/owners/products");
  }
};
exports.getAllProducts = async (req, res) => {
    try {
      const products = await productModel.find();
      
      res.render("ownerProducts", { 
        user: req.user, 
        products, 
        loggedin: true,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (err) {
      req.flash("error", "Failed to fetch products");
      res.redirect("/owners/admin");
    }
  };
  
  exports.getProductForEdit = async (req, res) => {
    try {
      const product = await productModel.findById(req.params.productid);
      
      if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/owners/products");
      }
      
      res.render("editProducts", { 
        user: req.user, 
        product, 
        loggedin: true,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (err) {
      req.flash("error", "Failed to fetch product");
      res.redirect("/owners/products");
    }
  };
  