import express from "express"
import authenticate from "../middleware/authMiddleware.js";
import expenseController from "../controllers/expenseController.js";
import expenseValidator, {
    expenseIdParamsSchema, updateExpenseSchema
} from "../validators/expenseValidator.js";
import validate from "../middleware/validate.js";
const router = express.Router();

// Create Expense
router.post("/groups/:groupId/expenses", authenticate, validate(expenseValidator), expenseController.createExpense);

// Get Group Expenses
router.get("/groups/:groupId/expenses", authenticate, expenseController.getGroupExpenses);

// Get Single Expense   
router.get("/expenses/:expenseId", authenticate, validate(expenseIdParamsSchema, "params"), expenseController.getExpenseById);

//PATCH (Update expenses)
router.patch(
    "/expenses/:expenseId",
    authenticate,
    validate(expenseIdParamsSchema, "params"),
    validate(updateExpenseSchema),
    expenseController.updateExpense
);

export default router;