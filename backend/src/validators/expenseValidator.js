import { z } from "zod";

const expenseSchema = z.object({
    amount: z.number().positive(),

    description: z.string().min(1).trim(),

    paidBy: z.string().min(1),

    splitType: z.enum([
        "EQUAL",
        "EXACT",
        "PERCENTAGE"
    ]),

    splits: z.array(
        z.object({
            user: z.string().min(1),
            value: z.number().nonnegative().optional()
        })
    ).min(1)
}).superRefine((data, ctx) => {

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

export default expenseSchema;