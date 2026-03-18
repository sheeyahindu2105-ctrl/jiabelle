import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true,
lowercase:true
},

password:{
type:String,
minlength:6,
required:function(){
return !this.isGoogleUser;
}
},

isGoogleUser:{
type:Boolean,
default:false
},

role:{
type:String,
enum:["user","seller","admin"],
default:"user"
},

sellerStatus:{
type:String,
enum:["pending","approved","rejected"],
default:undefined
},

isBlocked:{
type:Boolean,
default:false
},

avatar:{
type:String,
default:""
},

address:{
fullName:String,
phone:String,
street:String,
city:String,
state:String,
zip:String,
country:String
}

},
{timestamps:true}
);


/* ================= HASH PASSWORD ================= */

userSchema.pre("save", async function () {

if(this.isGoogleUser) return;

if(!this.isModified("password")) return;

const salt = await bcrypt.genSalt(10);

this.password = await bcrypt.hash(this.password,salt);

});


/* ================= MATCH PASSWORD ================= */

userSchema.methods.matchPassword = async function(enteredPassword){

if(!this.password) return false;

return await bcrypt.compare(enteredPassword,this.password);

};

export default mongoose.model("User",userSchema);