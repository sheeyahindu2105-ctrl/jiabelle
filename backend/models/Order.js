import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

products:[
{
product:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product",
required:true
},

seller:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

qty:{
type:Number,
required:true
},

price:{
type:Number,
required:true
},

orderStatus:{
type:String,
enum:[
"placed",
"processing",
"shipped",
"out_for_delivery",
"delivered",
"cancelled"
],
default:"placed"
}
}
],

totalAmount:{
type:Number,
required:true,
default:0
},
/* ⭐ ADD THIS BLOCK */

shippingAddress:{
name:String,
address:String,
city:String,
state:String,
pincode:String
},

paymentMethod:{
type:String,
enum:["COD","CARD","UPI"],
default:"COD"
},

paymentStatus:{
type:String,
enum:["pending","paid"],
default:"paid"
},

orderStatus:{
type:String,
enum:[
"placed",
"processing",
"shipped",
"delivered",
"cancelled"
],
default:"placed"
}

},
{timestamps:true}
);

export default mongoose.model("Order",orderSchema);