import { Request, Response, NextFunction } from "express";
import Appointment from "../models/appointmentModel";
import { CustomError } from "../utils/error";
import {
  emitAppointmentCallRequest,
  emitAppointmentCallAccepted,
  emitAppointmentCallEnded,
} from "../socket";

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

export const updateAppointmentPreferredTime = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId, preferredTime } = req.body;
    if (!appointmentId || !preferredTime) {
      throw new CustomError(
        "Missing required fields: appointmentId and preferredTime",
        400
      );
    }
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { preferredTime, status: "scheduled" },
      { new: true }
    );
    if (!appointment) {
      throw new CustomError("Appointment not found", 404);
    }
    res.json({ success: true, appointment });
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

export const updateAppointmentCallStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointmentId, callStatus, roomName } = req.body;
    if (!appointmentId || !callStatus) {
      throw new CustomError(
        "Missing required fields: appointmentId and callStatus",
        400
      );
    }

    const updateData: any = { callStatus };
    if (roomName) {
      updateData.roomName = roomName;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    );

    if (!appointment) {
      throw new CustomError("Appointment not found", 404);
    }

    // Emit socket events based on call status
    if (callStatus === "farmer_requested") {
      emitAppointmentCallRequest(
        appointment.expertUserId.toString(),
        appointment
      );
    } else if (callStatus === "expert_accepted") {
      if (appointment.farmerUserId) {
        emitAppointmentCallAccepted(
          appointment.farmerUserId.toString(),
          appointment
        );
      }
    } else if (callStatus === "call_ended") {
      if (appointment.farmerUserId) {
        emitAppointmentCallEnded(
          appointment.expertUserId.toString(),
          appointment.farmerUserId.toString(),
          appointment
        );
      }
    }

    res.json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
};

export const generateRoomName = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `agri-call-${timestamp}-${randomString}`;
};
