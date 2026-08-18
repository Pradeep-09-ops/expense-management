import express from "express"
import { createGroup, addMember } from "../controllers/groupController.js"
import authentication from "../middleware/authMiddleware.js"
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authenticate, createGroup);

router.post("/:id/members", authenticate, addMember);

export default router;