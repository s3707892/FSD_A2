import { Router } from "express";
import { BookingController } from "../controller/BookingController";

const router = Router();
const ctrl = new BookingController();

router.post("/bookings", (req, res) => ctrl.create(req, res));
router.get("/bookings/user/:userId", (req, res) => ctrl.getByUser(req, res));
router.get("/bookings/vendor/:vendorId", (req, res) => ctrl.getByVendor(req, res));
router.patch("/bookings/:id/status", (req, res) => ctrl.updateStatus(req, res));
router.post("/bookings/:id/review", (req, res) => ctrl.addReview(req, res));
router.get("/booking/stats/:vendorId", (req, res) => ctrl.getVendorStats(req, res));

export default router;
