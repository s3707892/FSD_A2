// api routes for creating, fetching and deleting venue blockout date ranges
import { Router } from "express";
import { BlockoutsController } from "../controller/BlockoutsController";

const router = Router();
const ctrl = new BlockoutsController();

router.get("/blockouts/venue/:venueId", (req, res) => ctrl.getByVenue(req, res));
router.post("/blockouts", (req, res) => ctrl.create(req, res));
router.delete("/blockouts/:id", (req, res) => ctrl.remove(req, res));

export default router;
