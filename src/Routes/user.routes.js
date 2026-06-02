import { Router } from "express";
import {
  registerUser,
  userLogOutController,
  loginUserController,
  refreshAccessTokenController,
  updateAccountDetailsController,
} from "../Controller/user.controller.js";
import express from "express";
import { upload } from "../Middleware/multer.middleware.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";

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

// LOGIN CONTROLLER

router.route("/login").post(userLogInController);

// SECURE ROUTE
router.route("/logout").post(verifyJWT, userLogOutController);
router.route("/refresh-accesstoken").post(refreshAccessTokenController);
router
  .route("/change-current-password")
  .put(verifyJWT, changeCurentPasswordController);
router.route("/getuser").post(verifyJWT, getCurrentUserController);
router.route("/updatuser").post(verifyJWT, updateAccountDetailsController);
export default router;
