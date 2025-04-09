const mongoose=require('mongoose');


const userSchema=mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    cart:[{
        product:{type:mongoose.Schema.Types.ObjectId,
        ref:"product",
        },
        quantity:{
            type:Number,
            default:0,
        }
    }],
    contact:Number,
    picture:String,
    Address:[{
        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean
    }]

})
module.exports=mongoose.model("user",userSchema);