const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
    name:String,
    image:Buffer,
    price:Number,
    discount:{
        type:Number,
        default:0
    },
    description:String,
    bgcolor:String,
    panelcolor:String,
    textcolor:String,
    available:{
        type:Boolean,
        default:true
    },
    cartcount:{
        type:Number,
        default:0
    }
},{ timestamps: true })
module.exports=mongoose.model("product",productSchema);