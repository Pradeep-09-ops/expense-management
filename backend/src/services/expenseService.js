import Group from "../models/groupModel.js";
import GroupMember from "../models/groupMemberModel.js";
import Expense from "../models/expenseModel.js";

const createExpense = async (groupId, currentUserId, expenseData) => {
    const {
        amount,
        description,
        date,
        paidBy,
        splitType,
        splits
    } = expenseData;

    // 1. Check if group exists
    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error("Group not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Check if current user is an active member
    const currentUserMembership = await GroupMember.findOne({
        groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!currentUserMembership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    // 3. Basic amount validation
    if (amount === undefined || amount === null || amount <= 0) {
        const error = new Error("Amount must be greater than 0");
        error.statusCode = 400;
        throw error;
    }

    // 4. Validate split type
    const validSplitTypes = ["EQUAL", "EXACT", "PERCENTAGE"];

    if (!validSplitTypes.includes(splitType)) {
        const error = new Error("Invalid split type");
        error.statusCode = 400;
        throw error;
    }

    // 5. Validate splits
    if (!Array.isArray(splits) || splits.length === 0) {
        const error = new Error("At least one split is required");
        error.statusCode = 400;
        throw error;
    }

    // 6. Prevent duplicate users in splits
    const splitUserIds = splits.map((split) => split.user);

    const uniqueUserIds = new Set(
        splitUserIds.map((id) => id.toString())
    );

    if (uniqueUserIds.size !== splitUserIds.length) {
        const error = new Error(
            "A user cannot appear more than once in splits"
        );
        error.statusCode = 400;
        throw error;
    }

    // 7. Check paidBy is an active member
    const payerMembership = await GroupMember.findOne({
        groupId,
        userId: paidBy,
        status: "ACTIVE"
    });

    if (!payerMembership) {
        const error = new Error(
            "Payer must be an active member of the group"
        );
        error.statusCode = 400;
        throw error;
    }

    // 8. Check every split user is an active member
    const groupMembers = await GroupMember.find({
        groupId,
        userId: { $in: splitUserIds },
        status: "ACTIVE"
    });

    if (groupMembers.length !== splitUserIds.length) {
        const error = new Error(
            "All split users must be active members of the group"
        );
        error.statusCode = 400;
        throw error;
    }

    let processedSplits;

    // 9. Process split
    switch (splitType) {

        case "EQUAL": {
            const equalAmount = amount / splits.length;

            processedSplits = splits.map((split) => ({
                user: split.user,
                value: equalAmount
            }));

            break;
        }

        case "EXACT": {
            const totalSplitAmount = splits.reduce(
                (total, split) => total + Number(split.value),
                0
            );

            if (totalSplitAmount !== Number(amount)) {
                const error = new Error(
                    "Sum of split amounts must equal expense amount"
                );
                error.statusCode = 400;
                throw error;
            }

            processedSplits = splits.map((split) => ({
                user: split.user,
                value: Number(split.value)
            }));

            break;
        }

        case "PERCENTAGE": {
            const totalPercentage = splits.reduce(
                (total, split) => total + Number(split.value),
                0
            );

            if (totalPercentage !== 100) {
                const error = new Error(
                    "Sum of percentages must equal 100"
                );
                error.statusCode = 400;
                throw error;
            }

            processedSplits = splits.map((split) => ({
                user: split.user,
                value: (Number(amount) * Number(split.value)) / 100
            }));

            break;
        }
    }

    // 10. Create expense
    const expense = await Expense.create({
        groupId,
        paidBy,
        amount,
        description,
        date,
        splitType,
        splits: processedSplits
    });

    return expense;
};

const getGroupExpenses = async (
    groupId,
    currentUserId,
    pageNumber,
    limitNumber,
    skip
) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error("Group not found");
        error.statusCode = 404;
        throw error;
    }

    const membership = await GroupMember.findOne({
        groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!membership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    const expenses = await Expense.find({ groupId })
        .populate("paidBy", "name email")
        .populate("splits.user", "name email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNumber);

    const totalExpenses = await Expense.countDocuments({
        groupId
    });

    const totalPages = Math.ceil(totalExpenses / limitNumber);

    return {
        expenses,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalExpenses,
            totalPages
        }
    };
};


const getExpenseById = async (expenseId, currentUserId) => {

    // 1. Find the expense
    const expense = await Expense.findById(expenseId)
        .populate("paidBy", "name email")
        .populate("splits.user", "name email");

    if (!expense) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Check whether current user belongs to the expense's group
    const membership = await GroupMember.findOne({
        groupId: expense.groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!membership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    return expense;
};

const updateExpense = async (
    expenseId,
    currentUserId,
    updateData
) => {

    const expense = await Expense.findById(expenseId);

    if (!expense) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
    }

    const membership = await GroupMember.findOne({
        groupId: expense.groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!membership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    const isAdmin = membership.role === "ADMIN";

    const isPayer =
        expense.paidBy.toString() ===
        currentUserId.toString();

    if (!isAdmin && !isPayer) {
        const error = new Error(
            "You do not have permission to update this expense"
        );
        error.statusCode = 403;
        throw error;
    }

    const finalAmount =
        updateData.amount ?? expense.amount;

    const finalSplitType =
        updateData.splitType ?? expense.splitType;

    const finalSplits =
        updateData.splits ?? expense.splits;

    const splitUserIds = finalSplits.map(
        (split) => split.user
    );

    const activeMembers = await GroupMember.find({
        groupId: expense.groupId,
        userId: { $in: splitUserIds },
        status: "ACTIVE"
    });

    if (activeMembers.length !== splitUserIds.length) {
        const error = new Error(
            "All split users must be active members of the group"
        );
        error.statusCode = 400;
        throw error;
    }

    if (finalSplitType === "EXACT") {

        const total = finalSplits.reduce(
            (sum, split) => sum + Number(split.value),
            0
        );

        if (total !== Number(finalAmount)) {
            const error = new Error(
                "Sum of split amounts must equal expense amount"
            );
            error.statusCode = 400;
            throw error;
        }
    }

    if (finalSplitType === "PERCENTAGE") {

        const total = finalSplits.reduce(
            (sum, split) => sum + Number(split.value),
            0
        );

        if (total !== 100) {
            const error = new Error(
                "Sum of percentages must equal 100"
            );
            error.statusCode = 400;
            throw error;
        }
    }

    let processedSplits = finalSplits;

    if (finalSplitType === "EQUAL") {

        const equalAmount =
            Number(finalAmount) / finalSplits.length;

        processedSplits = finalSplits.map((split) => ({
            user: split.user,
            value: equalAmount
        }));
    }

    if (finalSplitType === "PERCENTAGE") {

        processedSplits = finalSplits.map((split) => ({
            user: split.user,
            value:
                (Number(finalAmount) * Number(split.value)) / 100
        }));
    }

    Object.assign(expense, updateData);

    expense.amount = finalAmount;
    expense.splitType = finalSplitType;
    expense.splits = processedSplits;

    await expense.save();

    return expense;
};

const deleteExpense = async (expenseId, currentUserId) => {

    // 1. Find expense
    const expense = await Expense.findById(expenseId);

    if (!expense) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Check group membership
    const membership = await GroupMember.findOne({
        groupId: expense.groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!membership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    // 3. Check permission
    const isAdmin = membership.role === "ADMIN";

    const isPayer =
        expense.paidBy.toString() ===
        currentUserId.toString();

    if (!isAdmin && !isPayer) {
        const error = new Error(
            "You do not have permission to delete this expense"
        );
        error.statusCode = 403;
        throw error;
    }

    // 4. Delete expense
    await Expense.findByIdAndDelete(expenseId);

    return expense;
};

//Expense Summary Part->
const getGroupSummary = async (groupId, currentUserId) => {

    // 1. Verify group exists
    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error("Group not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify current user is an active member
    const currentUserMembership = await GroupMember.findOne({
        groupId,
        userId: currentUserId,
        status: "ACTIVE"
    });

    if (!currentUserMembership) {
        const error = new Error(
            "You are not an active member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    // 3. Get all active group members
    const groupMembers = await GroupMember.find({
        groupId,
        status: "ACTIVE"
    }).populate("userId", "name email");

    // 4. Get all group expenses
    const expenses = await Expense.find({
        groupId
    });

    // 5. Initialize balances
    const balances = {};

    groupMembers.forEach((member) => {
        balances[member.userId._id.toString()] = {
            paid: 0,
            owed: 0
        };
    });

    // 6. Process paidBy
    expenses.forEach((expense) => {

        const payerId = expense.paidBy.toString();

        if (balances[payerId]) {
            balances[payerId].paid += Number(expense.amount);
        }
    });

    // 7. Process splits
    expenses.forEach((expense) => {

        expense.splits.forEach((split) => {

            const userId = split.user.toString();

            if (balances[userId]) {
                balances[userId].owed += Number(split.value);
            }
        });
    });

    // 8. Calculate balance
    const summary = groupMembers.map((member) => {

        const userId = member.userId._id.toString();

        const paid = balances[userId].paid;
        const owed = balances[userId].owed;

        return {
            user: {
                _id: member.userId._id,
                name: member.userId.name,
                email: member.userId.email
            },
            paid,
            owed,
            balance: paid - owed
        };
    });

    // 9. User information is already populated above

    // 10. Return summary
    return {
        groupId,
        totalExpenses: expenses.reduce(
            (total, expense) => total + Number(expense.amount),
            0
        ),
        members: summary
    };
};

export default {
    createExpense,
    getGroupExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getGroupSummary
};