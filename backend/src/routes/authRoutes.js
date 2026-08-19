import express from "express";

import { register, login, getMe } from "../controllers/authController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pradeep Sharma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: pradeep@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *       400:
 *         description: Invalid request or user already exists
 */
router.post("/register", register);


/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns a JWT token.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: pradeep@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *
 *       400:
 *         description: Invalid email or password
 *
 *       404:
 *         description: User not found
 */
router.post("/login", login);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information.
 *     tags:
 *       - Authentication
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *
 *       401:
 *         description: Authentication required or invalid token
 */
router.get("/me", authenticate, getMe);

export default router;