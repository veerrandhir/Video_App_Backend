import mongoose from "mongoose";
import { DB_Name } from "../DB_Name/db_name.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/ ${DB_Name}`,
    );
    console.log(`DB Connected :: You have || ${DB_Name}`);
  } catch (error) {
    console.error("ERROR: connection failed ", error);
    process.exit(1);
  }
};
// console.log("db successfully connected", connectDB.connection.host);

export default connectDB;
