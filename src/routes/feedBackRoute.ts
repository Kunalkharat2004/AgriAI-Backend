import { Request, Response, Router } from "express";
import { AuthRequest } from "../middlewares/authentication";
import Feedback from "../models/feedback";

const router = Router();

router.post("/", (req:Request, res:Response) => {
    const _req = req as AuthRequest
    const userID = _req.userID;
    const date = new Date().toISOString().split("T")[0];
    const{feedbackDetails} = req.body;

    const feedback = new Feedback({
        user:userID,
        feedbackDetails:{
            ...feedbackDetails,
            date
        }
    })

    feedback.save();

    res.status(200).json({
        message:"Feedback sended successfully"
    })
})

export default router;