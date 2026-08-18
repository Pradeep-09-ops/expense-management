import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        currency: {
            type: String,
            required: true,
            default: "INR",
            uppercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;