import mongoose from "mongoose";

export interface IAppointment extends mongoose.Document {
  farmerName: string;
  farmerUserId?: mongoose.Types.ObjectId;
  expertUserId: mongoose.Types.ObjectId;
  crops: string[];
  issue: string;
  location?: string;
  languages?: string[];
  preferredTime?: string; // optional, free text or ISO date for schedule requests
  status: "pending" | "scheduled" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new mongoose.Schema(
  {
    farmerName: { type: String, required: true, trim: true },
    farmerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expertUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    crops: { type: [String], default: [], required: true },
    issue: { type: String, required: true },
    location: { type: String },
    languages: { type: [String], default: ["English"] },
    preferredTime: { type: String, optional: true },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
