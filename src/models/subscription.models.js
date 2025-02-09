import mongoose , { Schema } from "mongoose";

export const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //One who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //One to whom "subscriber" is subsribing
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscrption", subscriptionSchema)