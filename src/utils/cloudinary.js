import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath)=> {

    try {
        if(!localFilePath) {
            console.error("No file path provided for upload.");
            return null;}

         
        //upload to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        //File uploaded successfully
        console.log("File is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as uploading got successful
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as uploading got failed
        return null;
       // return console.log("problem is here")
    }


}

export {uploadOnCloudinary}