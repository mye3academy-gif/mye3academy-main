import express from "express";
import { getActiveNotifications } from "../../controllers/admin/adminNotificationController.js";

const router = express.Router();

router.get("/all", getActiveNotifications);

export default router;
