import mongoose, { Schema } from "mongoose";
import { timeStamp } from "node:console";

import bcrypt from "bcrypt";
import { use } from "react";

import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      // required: true,
    },
    thumbnail: {
      type: String, // Cloudinary link We don't store our image and video directly to db
      required: true,
    },
    watchHistory: {
      // keep objId of video to track watchHistory of user
      type: Sschem.Type.ObjectId,
      ref: "Video",
    },
    refreshToken: {
      // hold referesh token
      type: String,
    },
  },
  { timeStamp: true }, // Require created and updated time to be stored
);
// Remember here we will provide simple fn to pre as we need to use this
// arrow fn does'nt have it's this fn

userSchema.pre("save", async function (next) {
  // we passed next as params  sa it is a middleware
  if (!this.modified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Build own method to check passoword for login

// this method adds isPasswordCorrect method to each and every object

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};
export const User = mongoose.model("User", userSchema);
