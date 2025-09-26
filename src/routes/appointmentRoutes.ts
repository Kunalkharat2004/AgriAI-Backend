import express from "express";
import {
  createAppointment,
  listAppointmentsForExpert,
  updateAppointmentPreferredTime,
  updateAppointmentCallStatus,
} from "../controllers/appointmentController";

const router = express.Router();

router.post("/", createAppointment);
router.get("/expert/:expertId", listAppointmentsForExpert);
router.put("/preferred-time", updateAppointmentPreferredTime);
router.put("/call-status", updateAppointmentCallStatus);

export default router;
