import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

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

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // validate Avater Image required
  if (!avatarLocalPath) {
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

  console.log(req.body);

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

export { registerUser };
