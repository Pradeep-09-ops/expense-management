import express from "express"
import authenticate from "../middleware/authMiddleware.js";
import expenseController from "../controllers/expenseController.js";
const router = express.Router();


router.post("/groups/:groupId/expenses",authenticate, expenseController.createExpense);

export default router;