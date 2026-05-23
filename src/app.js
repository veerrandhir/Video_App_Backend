import cookieParser from "cookie-parser";
import express from "express";

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

export { app };
