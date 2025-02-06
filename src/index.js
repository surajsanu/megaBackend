import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
  path: "./.env",
});
//Best Approach
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR from express ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port :${process.env.PORT}`);
      console.log(existedUser)
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });

/*   First Approach
import express from "express"
const app = express()

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error" , (error)=>{
        console.log("ERROR from express ", error);
        throw error;
    })

    app.listen(process.env.PORT , ()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error("ERROR: ", error);
  }
})(); //IIFE started a semicolon is a best practice if we dont know there is semicolon or not in previous line
*/
