import express from "express"
import authenticate from "../middleware/authMiddleware.js";
import expenseController from "../controllers/expenseController.js";
import expenseValidator, {
    expenseIdParamsSchema, updateExpenseSchema
} from "../validators/expenseValidator.js";
import validate from "../middleware/validate.js";
const router = express.Router();


//Create Expense
/**
 * @openapi
 * /api/v1/groups/{groupId}/expenses:
 *   post:
 *     summary: Create an expense
 *     description: Creates a new expense for a group.
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad2c
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - paidBy
 *               - splitType
 *               - splits
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 3000
 *               description:
 *                 type: string
 *                 example: Hotel
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-18T06:15:06.530Z
 *               paidBy:
 *                 type: string
 *                 example: 6a8339286842ff613a14ad2b
 *               splitType:
 *                 type: string
 *                 enum:
 *                   - EQUAL
 *                   - EXACT
 *                   - PERCENTAGE
 *                 example: EQUAL
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - user
 *                     - value
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: 6a8339286842ff613a14ad2b
 *                     value:
 *                       type: number
 *                       example: 1000
 *
 *     responses:
 *       201:
 *         description: Expense created successfully
 *
 *       400:
 *         description: Invalid expense data
 *
 *       403:
 *         description: User is not an active member of the group
 *
 *       404:
 *         description: Group not found
 */
router.post(
    "/groups/:groupId/expenses",
    authenticate,
    validate(expenseValidator),
    expenseController.createExpense
);

//Get Group Expense
/**
 * @openapi
 * /api/v1/groups/{groupId}/expenses:
 *   get:
 *     summary: Get group expenses
 *     description: Returns the expenses belonging to a group with pagination.
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad2c
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Expenses fetched successfully
 *
 *       403:
 *         description: User is not an active member of the group
 *
 *       404:
 *         description: Group not found
 */
router.get(
    "/groups/:groupId/expenses",
    authenticate,
    expenseController.getGroupExpenses
);

// Get Single Expense   
/**
 * @openapi
 * /api/v1/expenses/{expenseId}:
 *   get:
 *     summary: Get an expense by ID
 *     description: Returns a single expense.
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         description: ID of the expense
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad35
 *
 *     responses:
 *       200:
 *         description: Expense fetched successfully
 *
 *       400:
 *         description: Invalid expense ID
 *
 *       403:
 *         description: User is not an active member of the group
 *
 *       404:
 *         description: Expense not found
 */
router.get(
    "/expenses/:expenseId",
    authenticate,
    validate(expenseIdParamsSchema, "params"),
    expenseController.getExpenseById
);

//PATCH (Update expenses)
/**
 * @openapi
 * /api/v1/expenses/{expenseId}:
 *   patch:
 *     summary: Update an expense
 *     description: Updates an existing expense. Only an active group admin or the person who paid for the expense can update it.
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         description: ID of the expense
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad35
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 example: 3500
 *
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 example: Hotel updated
 *
 *               paidBy:
 *                 type: string
 *                 pattern: "^[0-9a-fA-F]{24}$"
 *                 example: 6a8339286842ff613a14ad2b
 *
 *               splitType:
 *                 type: string
 *                 enum:
 *                   - EQUAL
 *                   - EXACT
 *                   - PERCENTAGE
 *                 example: EXACT
 *
 *               splits:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - user
 *                   properties:
 *                     user:
 *                       type: string
 *                       pattern: "^[0-9a-fA-F]{24}$"
 *                       example: 6a8339286842ff613a14ad2b
 *
 *                     value:
 *                       type: number
 *                       minimum: 0
 *                       example: 1500
 *
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-19T10:07:08.339Z
 *
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *
 *       400:
 *         description: Invalid expense data
 *
 *       403:
 *         description: User does not have permission to update this expense
 *
 *       404:
 *         description: Expense not found
 */
router.patch(
    "/expenses/:expenseId",
    authenticate,
    validate(expenseIdParamsSchema, "params"),
    validate(updateExpenseSchema),
    expenseController.updateExpense
);

//DELETE Route
/**
 * @openapi
 * /api/v1/expenses/{expenseId}:
 *   delete:
 *     summary: Delete an expense
 *     description: Deletes an expense. Only an active group admin or the person who paid for the expense can delete it.
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         description: ID of the expense
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad35
 *
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *
 *       400:
 *         description: Invalid expense ID
 *
 *       403:
 *         description: User does not have permission to delete this expense
 *
 *       404:
 *         description: Expense not found
 */
router.delete(
    "/expenses/:expenseId",
    authenticate,
    validate(expenseIdParamsSchema, "params"),
    expenseController.deleteExpense
);

//getting the summary of the expense
/**
 * @openapi
 * /api/v1/{groupId}/summary:
 *   get:
 *     summary: Get group expense summary
 *     description: Returns total expenses and the paid, owed, and balance amounts for each active group member.
 *     tags:
 *       - Summary & Settlement
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad2c
 *
 *     responses:
 *       200:
 *         description: Group summary fetched successfully
 *
 *       403:
 *         description: User is not an active member of the group
 *
 *       404:
 *         description: Group not found
 */
router.get(
    "/:groupId/summary",
    authenticate,
    expenseController.getGroupSummary
);

//settlement route
/**
 * @openapi
 * /api/v1/{groupId}/settlement:
 *   get:
 *     summary: Get group settlements
 *     description: Calculates the transactions required to settle all outstanding balances in the group.
 *     tags:
 *       - Summary & Settlement
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *         example: 6a833cf96842ff613a14ad2c
 *
 *     responses:
 *       200:
 *         description: Group settlements fetched successfully
 *
 *       403:
 *         description: User is not an active member of the group
 *
 *       404:
 *         description: Group not found
 */
router.get(
    "/:groupId/settlement",
    authenticate,
    expenseController.getGroupSettlements
);

export default router;