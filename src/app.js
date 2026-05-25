import cookieParser from "cookie-parser";

import express from "express";

import cors from "cors";

const app = express();

app.get("/", (req, res) => {
  res.send("hello world this is video server");
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "14kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

// router
// Simply we call rauter form here and this incoke user.router then

import userRouter from "./Routes/user.routes.js";

app.use("api/v1/users", userRouter);

export { app };
