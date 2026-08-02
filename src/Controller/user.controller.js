import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

import jwt from "jsonwebtoken";

// Gererate Access and refresh token method to use when required

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    // TODO :: Must repeate this code again and again
    const user = await User.findById(userId); // get user form userId we receive user id when this generate method is called

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken; // now add refresh token to user

    await user.save({
      // After successfull login check for user's refresh token on db
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while creating AccessToken and RefreshToken",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // register user controller need fullname , email , username , avatar  and all fields mentioned on userModel
  // check all mandetory field are provided
  // validate duplicate or unique field for username , email
  // create user and save detail to db
  // return details but no need to return password and refresh token

  const { fullName, email, username, password } = req.body;
  // here we are handling just data but to handle file too we need to inject multer middleware on register user router
  // Manual checking of each field
  //   if (fullName == "") {
  //     throw new ApiError(404, "Full name is required");
  //   }

  //   if (!email) {
  //     throw new ApiError(404, "Email is required");
  //   }
  //   if (!username) {
  //     throw new ApiError(404, "Username is required");
  //   }
  //   if (!avatar) {
  //     throw new ApiError(404, "Avatar is required");
  //   }

  // Alternate : Checking all field using some method New and advance concept

  if (
    [email, password, username, fullName].some(
      (fields) => fields?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are require ");
  }

  // find duplicate if available

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(
      409,
      "User already exist Unique email or username required",
    );
  }

  // TODO : Console.log each field and try to know what is there in each files

  // usually we get data from body but to handle images we injected multer so we have req.files access through multer as multer inject files into req method

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // avatar has multiple properties we need first prop ;

  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // This will give error if no cover image provided

  let coverImageLocalPath; // declear globally to avoid refference error
  // check manually to solve error

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    // validate Avater Image required
    throw new ApiError(400, "Avatar image not found");
  }

  // All file are available  Upload on cloudinary --> unlik uploaded file
  // WOOO:: Here is a catch we used multer to upload images on our db first and call it local file  then we upload our local file into cloud later without any hurry if we encounter any delay or error can try again but it will not disturb user and will not hamper user experience

  const avatarLocal = await uploadOnCloudinary(avatarLocalPath);

  const coverImageLocal = await uploadOnCloudinary(coverImageLocalPath);
  // Validate
  if (!avatarLocal) {
    throw new ApiError(400, "Avatar file is required");
  }

  // If all Done then save them all to DB

  // Every time User talk with db so just call create and pass all required field

  // console.log(req.body);

  const user = await User.create({
    fullName,
    email,
    username,
    password,
    avatar: avatarLocal.url,
    coverImage: coverImageLocal?.url || "",
  });

  // Once user created it will be stored as small user and to validate user
  // Each user or entry on mongodb it gives unique id : _id

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "User not created or not found ");
  }

  // Once user created and all set Send responce using Api Responce and return
  return res.status(201).json(
    new ApiResponse(
      200,
      createdUser, // ApiResponse req starus code  , data and , message
      "User Successfull created :: Congratulations ",
    ),
  );
  // Last line of code keep distance

  // don't touch it
});

// :: NEW SECTION HERE ===> LOGIN USER

const loginUserController = asyncHandler(async (req, res) => {
  //TODO :: Get username , email , password
  // Validate , Inject middleware to find user id and and compare password
  // if password match login user and retun data
  // generate  accessstoken and refresh token
  // pass it through cookies
  //

  const { username, password, email } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or password is required");
  }
  // User is in db call it and get also save it's reference into a varaible called user for further operations

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User Does not exist");
  }

  // if user found we check password but how ? create a method to check password -> call the methos ispassword correct
  const isPasswordValid = await user.isPasswordCorrect(password); // called a method to check password

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  // We require Access and refresh token many time so create a method
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  // we have username from login so pass id through it to get access and refresh token

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  // Remove password and refresh token because we no neeed to send password back to client

  // send cookies to user and secure true means only through server side it can be changen or modifies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // After all return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      // we don't need to send saparate json but we are sendin in case if user wish to save cookies self to use in mobile app and other
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully",
      ),
    );

  //
  //
  //
  //
});

// NEXT :: LOGOUT USER
// Get user => we don't have user so create a middleware and get user through jwtverify

const userLogOutController = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, // here is a magic happened we pass verifyJWT as middleware  in logout router and it give us access of all methods

    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh token and access token used so that user don't need to give email and password again and again

const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookie.refreshToken || user.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  const decodeToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  if (!decodeToken) {
    throw new ApiError(404, "Token not found ");
  }

  const user = await User.findById(decodeToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh Token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is Expired or used");
  }
  // If everything is ok and passed then generate new accesstoke and set into cookie

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Afret option seting for cookie
  const { generatedAccessToken, generatedRefreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", generatedAccessToken, options)
    .cookie("refreshToken", generateRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: generatedAccessToken,
          refreshToken: generatedRefreshToken,
        },
        "Access Token refreshed",
      ),
    );
});

// Change password controller
// TODO :: Get old password and newPassword form req.body
// Check password correct using check password method
// Set password into user
// return res no need to return user data

const changeCurentPasswordController = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const checkIsPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!checkIsPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false }); // Because we already have user logined As we injected middleware verifyJwt

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// To get user we need to just make a request and use middleware to verify user is login
// So we use verifyJwt just  or authmiddleware to check user is login or  not in the router
const getCurrentUserController = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// get data form req.body
// check user is logined or not
// If user is logged in update changes and save
// return success status back

const updateAccountDetailsController = asyncHandler(async (req, res) => {
  const { name, userName, email } = req.body;
  const user = await User.findById(req.user._id); // need to use findbyidandupdate
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not Found"));
  }
  user.userName = userName;
  user.email = email;
  user.fullName = name;

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Successfully"));
});

const updateCoverImageController = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(
      400,
      "Something went wrong while uploading cover image ",
    );
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
});

const updateAvatarController = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarLocalPath.url) {
    throw new ApiError(
      400,
      "Something went wrong while uploading cover image ",
    );
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image Updated Successfully"));
});

export {
  registerUser,
  loginUserController,
  userLogOutController,
  refreshAccessTokenController,
  changeCurentPasswordController,
  getCurrentUserController,
  updateAccountDetailsController,
  updateCoverImageController,
  updateAvatarController,
};
