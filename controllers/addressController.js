const userModel = require('../models/user-model');

exports.getUserAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    res.render("address", { user });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/shop');
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { name, street, pincode, city, phone, state, isDefault } = req.body;
    const user = await userModel.findById(req.user._id);
    
    const newAddress = {
      name,
      street,
      pincode,
      city,
      phone,
      state,
      isDefault: isDefault ? true : false
    };
    
    if (newAddress.isDefault) {
      user.Address.forEach(address => {
        address.isDefault = false;
      });
    }
    
    user.Address.push(newAddress);
    await user.save();
    res.redirect('/users/address/' + req.user._id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/users/address/' + req.user._id);
  }
};

exports.getAddressForEdit = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const address = user.Address.id(req.params.addressid);
    
    if (!address) {
      req.flash("error", "Address not found");
      return res.redirect('/users/address/' + req.user._id);
    }
    
    res.render("editAddress", { user, address });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/users/address/' + req.user._id);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const address = user.Address.id(req.params.addressid);
    
    if (!address) {
      req.flash("error", "Address not found");
      return res.redirect('/users/address/' + req.user._id);
    }
    
    const updates = {
      name: req.body.name,
      state: req.body.state,
      pincode: req.body.pincode,
      isDefault: req.body.isDefault ? true : false,
      street: req.body.street,
      phone: req.body.phone,
      city: req.body.city
    };
    
    if (updates.isDefault) {
      user.Address.forEach(add => {
        add.isDefault = false;
      });
    }
    
    Object.assign(address, updates);
    await user.save();
    res.redirect('/users/address/' + req.user._id);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect('/users/address/' + req.user._id);
  }
};