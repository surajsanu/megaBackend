import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
  {
    username: {
      type: String,
      requireed: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, //optimized way to make it searchable
    },
    email: {
      type: String,
      requireed: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      requireed: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary URL
      requireed: true,
    },
    coverImage: {
      type: String, // cloudinary URL
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()  // logic that ensures if password is not modifies then no encryption should be done
        this.password = bcrypt.hash(this.password , 10 )  //(the thing which we want to encrypt , salts that means how many rounds we want to encrypt)
        next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
    
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User = mongoose.model("User", userSchema);
