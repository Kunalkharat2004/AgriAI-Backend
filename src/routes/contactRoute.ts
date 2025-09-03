import { Request, Response, Router } from "express";
import { AuthRequest } from "../middlewares/authentication";
import Query from "../models/queryModel";

const router = Router()

router.post("/", (req:Request, res:Response)=>{
    const _req = req as AuthRequest
    const userID = _req.userID;
    const date = new Date().toISOString().split("T")[0];
    const{queryDetails} = req.body;

    const query = new Query({
        user:userID,
        queryDetails:{
            ...queryDetails,
            date
        }
    })
    
    query.save();

    res.status(200).json({
        message:"Query posted successfully"
    })
})

export default router;