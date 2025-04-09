const mongoose=require('mongoose')

const orderSchema=mongoose.Schema({
     product:[{
            products:{type:mongoose.Schema.Types.ObjectId,
            ref:"product",
            },
            quantity:{
                type:Number,
                default:0,
            },
            price:Number
        }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        },
    Addressid:{
        type:mongoose.Schema.Types.ObjectId,
        },
        totalAmount:Number,
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
    }, { timestamps: true })

module.exports=mongoose.model("order",orderSchema);