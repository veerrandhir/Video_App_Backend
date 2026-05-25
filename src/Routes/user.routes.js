import { Router } from "express";
import { registerUser } from "../Controller/user.controller.js";
import express from "express";
const router = Router();
// no need to keep it in variable
// this is ulternate way to write clean and clear code
// Traditional method
// app.get("userlogin", loginUsercontroller)

router.route("/register").post(registerUser);

export default router;
