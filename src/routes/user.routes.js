import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount:1
    },
    {
        name: "coverImage",
        maxCount:1
      },
    
  ]), //we used fileds as it will take so many inputs as different fields
  registerUser
);

export default router;
