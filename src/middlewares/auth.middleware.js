import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.models.js";

export const verifyJWT = asyncHandler(async(req, _, next)=>{   //Here _ stands for res as its not in use we used underscore instead of res
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replce("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unautherized Request")        
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message||"invalid access token")
    }
})