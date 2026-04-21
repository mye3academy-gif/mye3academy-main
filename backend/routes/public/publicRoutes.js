import express from "express";
const router = express.Router();

import {
  getAllCategories,
  getPublishedMockTests,
  getMockTestById,
  getUpcomingExams,
  getPublishedSubscriptionPlans,
} from "../../controllers/public/portalController.js";



router.get("/categories", getAllCategories);
router.get("/subscriptions", getPublishedSubscriptionPlans);
router.get("/mocktests", getPublishedMockTests);
router.get("/upcoming-exams", getUpcomingExams); // New logic for Home gallery
router.get("/mocktests/:id", getMockTestById);

export default router;