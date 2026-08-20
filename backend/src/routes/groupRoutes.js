import express from "express";

import {
    createGroup,
    addMember,
    getGroups, getGroup
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


//GET Groups
/**
 * @openapi
 * /api/v1/groups:
 *   get:
 *     summary: Get user's groups
 *     description: Returns all active groups that the authenticated user is a member of.
 *     tags:
 *       - Groups
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Groups fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Groups fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6a833cf96842ff613a14ad2c
 *                       groupId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6a833cf96842ff613a14ad2c
 *                           name:
 *                             type: string
 *                             example: Goa Trip
 *                           currency:
 *                             type: string
 *                             example: INR
 *                           ownerId:
 *                             type: string
 *                             example: 6a8339286842ff613a14ad2b
 *                       userId:
 *                         type: string
 *                         example: 6a8339286842ff613a14ad2b
 *                       role:
 *                         type: string
 *                         example: ADMIN
 *                       status:
 *                         type: string
 *                         example: ACTIVE
 *
 *       401:
 *         description: Authentication required
 */
router.get("/", authenticate, getGroups);

//GET one Group by :groupId
/**
 * @openapi
 * /api/v1/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     description: Returns a group if the authenticated user is an active member of that group.
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
 *     responses:
 *       200:
 *         description: Group fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: User is not a member of this group
 *
 *       404:
 *         description: Group not found
 */
router.get("/:id", authenticate, getGroup);

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