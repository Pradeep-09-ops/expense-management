import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    splitType: {
      type: String,
      enum: ["EQUAL", "EXACT", "PERCENTAGE"],
      required: true,
    },

    splits: {
      type: [splitSchema],
      required: true,
      validate: {
        validator: (splits) => splits.length > 0,
        message: "At least one split is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Expense", expenseSchema);