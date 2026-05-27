import { ApiError } from "../Utils/ApiError";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    // if we were logged => must have access token in cookies || get throgh authorization
    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Validate
    if (!token) {
      throw new ApiError(404, "Auth Token not found");
    }

    // If token then verify it
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token ");
    }

    // if we have user and valid token then
    req.user = user; // Simply assign decodedtoken to user and call next it will be pased to logoutcontroller and use there

    next();

    //
  } catch (error) {
    throw new ApiError(401, "Something went wrong while verifying user ");
  }
};
