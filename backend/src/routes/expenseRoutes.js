import express from "express"
import authenticate from "../middleware/authMiddleware.js";
import expenseController from "../controllers/expenseController.js";
import expenseValidator from "../validators/expenseValidator.js";
import validate from "../middleware/validate.js";
const router = express.Router();


router.post("/groups/:groupId/expenses", authenticate, validate(expenseValidator), expenseController.createExpense);

router.get("/groups/:groupId/expenses", authenticate, expenseController.getGroupExpenses);

export default router;