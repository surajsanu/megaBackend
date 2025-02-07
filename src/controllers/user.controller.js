import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //Steps:
  //get User details from frontend
  //validation- not empty etc
  //check if user already exists:username and emails
  //check for images, check for avatar
  //upload them cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  // return res

  //get User details from frontend
  const { fullName, email, username, password } = req.body;
  //console.log("email:", email);

  //validation- not empty etc
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user already exists:username and emails
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username alredy exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  //check for images, check for avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //upload them cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  
  if (!avatar) {
    throw new ApiError(400, "Avatar is required")
  }

  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //example of a corner case
    email,
    password,
    username: username.toLowerCase(),
  });

  
  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-refreshToken -password"   //Here -sign for not to select the field and these dhould be separated by space
  )

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  // return res
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )
});

export { registerUser };
