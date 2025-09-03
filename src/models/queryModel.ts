import mongoose, { Schema } from "mongoose";

const querySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        // unique: true,
    },
    queryDetails: {
        querySubject: { type: String, default: null,required : true },
        query: { type: String, default: null,required: true },
        date: { type: String, default: null,required : true },
        status: { type: String, default: "pending" },
    },
})

const Query = mongoose.model("Query", querySchema);
export default Query;
