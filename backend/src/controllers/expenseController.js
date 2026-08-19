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

        const { page = "1", limit = "10" } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const result = await expenseService.getGroupExpenses(
            groupId,
            currentUserId,
            pageNumber,
            limitNumber,
            skip
        );

        res.status(200).json({
            success: true,
            message: "Expenses fetched successfully",
            data: result.expenses,
            pagination: result.pagination
        });

    } catch (error) {
        next(error);
    }
};

const getExpenseById = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const currentUserId = req.user.userId;

        const expense = await expenseService.getExpenseById(
            expenseId,
            currentUserId
        );

        res.status(200).json({
            success: true,
            message: "Expense fetched successfully",
            data: expense
        });

    } catch (error) {
        next(error);
    }
};

//PATCH 
const updateExpense = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const currentUserId = req.user.userId;

        const expense = await expenseService.updateExpense(
            expenseId,
            currentUserId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: expense
        });

    } catch (error) {
        next(error);
    }
};

//DELETE
const deleteExpense = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const currentUserId = req.user.userId;

        const expense = await expenseService.deleteExpense(
            expenseId,
            currentUserId
        );

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
            data: expense
        });

    } catch (error) {
        next(error);
    }
};


export default {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};