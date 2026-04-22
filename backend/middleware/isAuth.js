import jwt from "jsonwebtoken";
import User from "../models/Usermodel.js";

/**
 * Middleware to authenticate user via JWT token in cookies
 */
export const isAuth = async (req, res, next) => {
  try {
    // 1. Try to get token from Authorization header first (Bearer token)
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Fallback to cookies if not in headers
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authenticated. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    const user = await User.findById(userId).select("_id role");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH_MIDDLEWARE_ERROR:", error.message);
    return res
      .status(401)
      .json({ message: "Authentication failed.", error: error.message });
  }
};

/**
 * Middleware to restrict access to Admin only
 */
export const isAdmin = (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase()?.trim() || "";
  
  if (req.user && userRole === "admin") {
    next();
  } else {
    console.error(`🔴 ACCESS_FORBIDDEN: User ${req.user?._id} has role: "${req.user?.role}"`);
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }
};
