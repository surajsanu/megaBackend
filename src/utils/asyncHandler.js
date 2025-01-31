const asyncHandler= (requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }

}

export {asyncHandler}

//2nd variety
//Higher order function (callback function in a callback function)
// const asyncHandler= (fn)=>async(req,res,next)=>{
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code|| 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }