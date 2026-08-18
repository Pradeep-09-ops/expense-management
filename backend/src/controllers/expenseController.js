import expenseService from "../services/expenseService.js";

const createExpense = async (req, res, next) => {
    try {
        console.log("REQ.USER:", req.user);
        console.log("GROUP ID:", req.params.groupId);

        const { groupId } = req.params;
        const currentUserId = req.user.userId;

        console.log("CURRENT USER ID:", currentUserId);

        const expense = await expenseService.createExpense(
            groupId,
            currentUserId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: expense,
        });
    } catch (error) {
        next(error);
    }
};

const getGroupExpenses = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const currentUserId = req.user.userId;

        const expenses = await expenseService.getGroupExpenses(
            groupId,
            currentUserId
        );

        res.status(200).json({
            success: true,
            message: "Expenses fetched successfully",
            data: expenses
        });

    } catch (error) {
        next(error);
    }
};

export default {
  createExpense,
  getGroupExpenses
};