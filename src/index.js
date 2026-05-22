import express from "express";
import dotenv from "dotenv";
import { DB_Name } from "./DB_Name/db_name.js";
import connectDB from "./DB/index.js";
dotenv.config({
  path: "../.env",
});

const app = express();
connectDB();

app.get("/", (req, res) => {
  res.send("hello world this is video server");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
  app.on("error", (error) => {
    console.error(" # ERROR :  While connecting with Server", error);
    throw error;
  });
  //   console.error("ERROR: Some thing went wrong while creating server");
});
