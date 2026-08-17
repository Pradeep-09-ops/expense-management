import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["ADMIN", "MEMBER"],
            default: "MEMBER"
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

groupMemberSchema.index(
    { groupId: 1, userId: 1 },
    { unique: true }
);

const GroupMember = mongoose.model("GroupMember" , groupMemberSchema);

export default GroupMember;