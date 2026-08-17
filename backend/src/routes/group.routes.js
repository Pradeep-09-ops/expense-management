import express from "express"
import { createGroup, addMember } from "../controllers/group.controller.js"
import authentication from "../middleware/auth.middleware.js"
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", authenticate, createGroup);

router.post("/:id/members", authenticate, addMember);

export default router;