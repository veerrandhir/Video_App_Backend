import express from "express";

const app = express();
app.get("/", (req, res) => {
  res.send("hello world this is video server");
});
export { app };
