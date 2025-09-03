import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

const validateRequest = (req:Request,res:Response,next: NextFunction)=>{
    const result = validationResult(req);
    if(!result.isEmpty()){
        return res.status(400).json({errors:result.array()});
    }

    req.body = matchedData(req)

    next();
}

export default validateRequest;