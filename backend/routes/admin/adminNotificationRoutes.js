import express from "express";
import { createNotification, getAllNotificationsAdmin, deleteNotification } from "../../controllers/admin/adminNotificationController.js";

const router = express.Router();

router.post("/send", createNotification);
router.get("/all", getAllNotificationsAdmin);
router.delete("/:id", deleteNotification);

export default router;
