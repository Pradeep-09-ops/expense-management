import { z } from "zod";

// Reusable MongoDB ObjectId validation
const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");


const expenseSchema = z.object({
    amount: z.number().positive(),

    description: z.string().min(1).trim(),

    paidBy: objectIdSchema,

    splitType: z.enum([
        "EQUAL",
        "EXACT",
        "PERCENTAGE"
    ]),

    splits: z.array(
        z.object({
            user: objectIdSchema,
            value: z.number().nonnegative().optional()
        })
    ).min(1)

}).superRefine((data, ctx) => {

    // EXACT validation
    if (data.splitType === "EXACT") {

        data.splits.forEach((split, index) => {

            if (split.value === undefined) {
                ctx.addIssue({
                    code: "custom",
                    message: "Value is required for EXACT split",
                    path: ["splits", index, "value"]
                });
            }

        });

    }

    // PERCENTAGE validation
    if (data.splitType === "PERCENTAGE") {

        data.splits.forEach((split, index) => {

            if (split.value === undefined) {
                ctx.addIssue({
                    code: "custom",
                    message: "Value is required for PERCENTAGE split",
                    path: ["splits", index, "value"]
                });
            }

            if (split.value !== undefined && split.value > 100) {
                ctx.addIssue({
                    code: "custom",
                    message: "Percentage cannot be greater than 100",
                    path: ["splits", index, "value"]
                });
            }

        });

    }

});


// Params validation for:
// GET /expenses/:expenseId
const expenseIdParamsSchema = z.object({
    expenseId: objectIdSchema
});


export {
    expenseIdParamsSchema
};

export default expenseSchema;