import express from "express";

import {
    createGroup,
    addMember
} from "../controllers/groupController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/groups:
 *   post:
 *     summary: Create a new group
 *     description: Creates a new expense management group for the authenticated user.
 *     tags:
 *       - Groups
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Goa Trip
 *
 *     responses:
 *       201:
 *         description: Group created successfully
 *
 *       400:
 *         description: Invalid group data
 *
 *       401:
 *         description: Authentication required
 */
router.post("/", authenticate, createGroup);


/**
 * @openapi
 * /api/v1/groups/{id}/members:
 *   post:
 *     summary: Add a member to a group
 *     description: Adds an existing user to the specified group.
 *     tags:
 *       - Groups
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add to the group
 *                 example: 6a8339286842ff613a14ad2b
 *
 *     responses:
 *       201:
 *         description: Member added successfully
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User does not have permission to add members
 *
 *       404:
 *         description: Group or user not found
 */
router.post("/:id/members", authenticate, addMember);

export default router;