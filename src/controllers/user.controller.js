import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

//Methods to  generate accessToken and refreshToken which can be used in multiple places
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false }); //as this user is from mongodb so here save() method is available
    //Here we know as every required field should be given to create a user but here we just gave the refresh token, so here we marked the validationBeforeSave as false

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access Token"
    );
  }
};

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //check for images, check for avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //upload them cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
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
    "-refreshToken -password" //Here -sign for not to select the field and these dhould be separated by space
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from req body
  //username or email
  //match the username or email in our db
  //password check
  //accessToken and refreshToken generate
  //send the tokens in a secured cookie
  //send a message that logged in successfully

  // get data from req body
  const { email, username, password } = req.body;
  //username or email
  if (!(username || email)) {
    throw new ApiError(400, "Username or email anyone is required");
  }
  //match the username or email in our db
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credential");
  }

  //accessToken and refreshToken generate by the previously created method
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //This operation should be avoided if the DB calls are expensive , otherwise its best(overally optional)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //configuring options for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  //send the tokens in a secured cookie and a message that says logged in successfully
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //To make this whole object new
    }
  );

  //configuring options for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };


  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request")
    }
  
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token")
    }
    if(incomingRefreshToken !== user?.refreshAccessToken){
      throw new ApiError(401,"Refresh Token is expired or used")
    }
  
    const {accessToken , newRefreshToken}await generateAccessAndRefreshToken(user._id)
  
    //configuring options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken, refreshToken: newRefreshToken
        },
        "Access Token is refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }


  
})

export { registerUser, loginUser, logoutUser };
