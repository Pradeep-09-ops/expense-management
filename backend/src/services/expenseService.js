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

    // 1. Check whether group exists
    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error("Group not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Check whether current user is an active member
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

    // 3. Validate amount
    if (!amount || amount <= 0) {
        const error = new Error("Amount must be greater than 0");
        error.statusCode = 400;
        throw error;
    }

    // 4. Check whether paidBy is an active group member
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

    // 5. Validate splits
    if (!Array.isArray(splits) || splits.length === 0) {
        const error = new Error("At least one split is required");
        error.statusCode = 400;
        throw error;
    }

    // 6. Check that every split user belongs to the group
    const splitUserIds = splits.map((split) => split.user);

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

    // 7. Process split type
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

        default: {
            const error = new Error("Invalid split type");
            error.statusCode = 400;
            throw error;
        }
    }

    // 8. Create expense
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

export default {
    createExpense
};