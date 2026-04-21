import Notification from "../../models/Notification.js";
import { getIO } from "../../socket.js";

/**
 * 1. Admin: Create & Broadcast Notification
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and Message are required" });
    }

    const newNotification = new Notification({
      title,
      message,
      type,
      link,
    });

    await newNotification.save();

    // 📡 BROADCAST via Socket.io
    try {
      const io = getIO();
      io.emit("new_notification", newNotification);
    } catch (socketErr) {
      console.error("Socket broadcast failed, but notification was saved:", socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Notification sent and broadcasted successfully",
      notification: newNotification,
    });
  } catch (err) {
    console.error("CREATE_NOTIFICATION_ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * 2. Admin: Get All Notifications (For Management)
 */
export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

/**
 * 3. Student/Public: Get Active Notifications
 */
export const getActiveNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

/**
 * 4. Admin: Delete Notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
