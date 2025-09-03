import mongoose, { Schema } from "mongoose";

const feedBackSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    feedbackDetails: {
        feedback: { type: String, default: null, required:true },
        date: { type: String, default: null, required:true },
    },
});

const Feedback = mongoose.model("Feedback", feedBackSchema);
export default Feedback;