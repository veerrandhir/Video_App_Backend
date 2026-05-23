import dotenv from "dotenv";
import { DB_Name } from "./DB_Name/db_name.js";
import connectDB from "./DB/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "../.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      // app.on("ERROR : Unable to connect with server");
      console.log(":: Server is connected : Listning on :", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("ERROR : While creating server || Unable to connect ||");
  });
