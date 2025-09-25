import express from "express";
import {
  createAppointment,
  listAppointmentsForExpert,
} from "../controllers/appointmentController";

const router = express.Router();

router.post("/", createAppointment);
router.get("/expert/:expertId", listAppointmentsForExpert);

export default router;


