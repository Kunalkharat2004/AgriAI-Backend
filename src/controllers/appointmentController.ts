import { Request, Response, NextFunction } from "express";
import Appointment from "../models/appointmentModel";
import { CustomError } from "../utils/error";

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmerName,
      farmerUserId,
      expertUserId,
      crops,
      issue,
      location,
      languages,
      preferredTime,
    } = req.body;

    if (!farmerName || !expertUserId || !issue || !crops?.length) {
      throw new CustomError("Missing required fields", 400);
    }

    const doc = await Appointment.create({
      farmerName,
      farmerUserId,
      expertUserId,
      crops,
      issue,
      location,
      languages,
      preferredTime,
    });

    res.status(201).json({ success: true, appointment: doc });
  } catch (err) {
    next(err);
  }
};

export const listAppointmentsForExpert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { expertId } = req.params;
    const docs = await Appointment.find({ expertUserId: expertId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, appointments: docs });
  } catch (err) {
    next(err);
  }
};


