import { Router } from "express";
import { registerUser } from "../Controller/user.controller.js";
import express from "express";
import { upload } from "../Middleware/multer.middleware.js";

const router = Router();
// no need to keep it in variable
// this is ulternate way to write clean and clear code
// Traditional method
// app.get("userlogin", loginUsercontroller)

router.route("/register").post(
  // before calling register user we inject multer middleware to upload files becauce we can automitaclly handle text info but to handle file we need middleware
  upload.fields([
    //BUG::  multer.fields require array
    // no. of objects depends on how many files we required
    // we are handling only two fils so need two object
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser,
);

export default router;
