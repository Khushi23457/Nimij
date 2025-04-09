const orderModel = require('../models/order-model');
const userModel = require('../models/user-model');

exports.getOwnerOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    
    res.render("ownerorder", {
      user: null,
      orders,
      success: req.flash('success'),
      loggedin: true,
      error: req.flash('error')
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/owners/admin");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const status = req.body.status || 'pending';
    
    if (!req.params.orderid) {
      req.flash("error", "Missing required information");
      return res.redirect("/owners/orders");
    }
    
    const order = await orderModel.findById(req.params.orderid);
    
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/owners/orders");
    }
    
    if (order.status === 'delivered' || order.status === 'cancelled') {
      req.flash("error", "Cannot update status of delivered or cancelled orders");
      return res.redirect('/owners/orders');
    }
    
    order.status = status;
    await order.save();
    req.flash("success", "Order status updated successfully");
    res.redirect("/owners/orders");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/owners/orders");
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/');
    }
    
    const orders = await orderModel.find({ user: req.user._id })
      .populate('product.products')
      .sort({ createdAt: -1 });
    
    res.render("orders", {
      user: req.user,
      orders,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/');
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate('cart.product');
    
    if (!user.cart || user.cart.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/shop');
    }
    
    const productItems = [];
    let shipfee;
    let totalprice = 0;
    
    user.cart.forEach(function(items) {
      const item = items.product;
      const total = item.price;
      const dis = item.discount;
      
      productItems.push({
        products: item._id,
        quantity: items.quantity,
        price: total - dis
      });
      
      totalprice += (total - dis) * items.quantity;
    });
    
    if (totalprice > 500) { 
      shipfee = 0;
    } else { 
      shipfee = 40;
    }
    
    totalprice += shipfee;
    
    await orderModel.create({
      product: productItems,
      user: user._id,
      Addressid: req.params.addressid,
      totalAmount: totalprice,
      paymentMethod: 'Cash on Delivery',
    });
    
    user.cart = [];
    await user.save();
    req.flash('success', 'Order placed successfully!');
    return res.redirect('/users/myorders/' + req.user._id);
  } catch (err) {
    req.flash('error', 'Failed to place order');
    res.redirect('/shop');
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderid);
    
    if (order.user.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/users/myorders');
    }
    
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      order.status = 'cancelled';
      await order.save();
      req.flash('success', 'Order cancelled successfully');
    } else {
      req.flash('error', 'This order cannot be cancelled');
    }
    
    res.redirect('/users/myorders/' + req.user._id);
  } catch (err) {
    req.flash('error', 'Failed to cancel order');
    return res.redirect('/users/myorders/' + req.user._id);
  }
};