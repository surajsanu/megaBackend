import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:'../.env'
})
//Best Approach
connectDB()






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