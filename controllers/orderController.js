const orderModel = require('../models/order-model');
const userModel = require('../models/user-model');
const razorpayInstance = require('../config/razorpay-config'); 

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
    if(status==='delivered'){
      order.paymentStatus='completed'
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
      const dis = item.discount || 0;
      
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
      paymentStatus:'pending'
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

exports.showPaymentSelection = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate('cart.product');
    const addressId = req.params.addressid;
    
    if (!user.cart || user.cart.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/shop');
    }
    
    const selectedAddress = user.Address.id(addressId);
    if (!selectedAddress) {
      req.flash('error', 'Address not found');
      return res.redirect('/users/address/' + req.user._id);
    }
    
    if (!process.env.RAZORPAY_KEY_ID) {
       
      req.flash('error', 'Payment configuration error');
      return res.redirect('/users/address/' + req.user._id);
    }
    
    res.render("selectpayment", {
      user: req.user,
      addressId: addressId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
     
    req.flash('error', 'Something went wrong');
    res.redirect('/shop');
  }
};

exports.placeOrderOnline = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('cart.product');
        
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }
        
        const productItems = [];
        let shipfee;
        let totalprice = 0;
        
        user.cart.forEach(function(items) {
            const item = items.product;
            const total = item.price;
            const dis = item.discount || 0;
            
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
           
        const razorpay = razorpayInstance();
 
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const userIdShort = user._id.toString().slice(-6); 
        const receipt = `ord_${timestamp}_${userIdShort}`; // Format: ord_12345678_abc123
             
        const razorpayOrder = await razorpay.orders.create({
            amount: totalprice * 100,  
            currency: 'INR',
            receipt: receipt,
            notes: {
                userId: user._id.toString(),
                addressId: req.params.addressid
            }
        });
        
        
        const order = await orderModel.create({
            product: productItems,
            user: user._id,
            Addressid: req.params.addressid,
            totalAmount: totalprice,
            paymentMethod: 'Online Payment',
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: 'pending'
        });
        
        
        res.json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalprice,
            currency: 'INR',
            name: 'Nimij',
            description: 'Order Payment',
            prefill: {
                name: user.fullname || '',
                email: user.email || '',
                contact: user.contact ? user.contact.toString() : ''
            }
        });
        
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create order: ' + err.message
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification data'
            });
        }
        
        const razorpay = razorpayInstance();
        const crypto = require('crypto');
        
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
        
        if (razorpay_signature === expectedSign) {
            
            const order = await orderModel.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            
          
            order.paymentStatus = 'completed';
            order.razorpayPaymentId = razorpay_payment_id;
            await order.save();
  
            const user = await userModel.findById(order.user);
            if (user) {
                user.cart = [];
                await user.save();
            }
            
            res.json({
                success: true,
                message: 'Payment successful! Order placed.',
                redirectUrl: `/users/myorders/${order.user}`
            });
        } else {
            
            await orderModel.findByIdAndUpdate(orderId, { 
                paymentStatus: 'failed' 
            });
            
            res.status(400).json({
                success: false,
                message: 'Payment verification failed '
            });
        }
        
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed: ' + err.message
        });
    }
};