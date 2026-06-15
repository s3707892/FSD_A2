// api routes for venue crud operations including create, update and soft delete
import { Router } from "express";
import { VenueController } from "../controller/VenueController";

const router = Router();
const ctrl = new VenueController();

router.get("/venues", (req, res) => ctrl.getAll(req, res));
router.get("/venues/vendor/:vendorId", (req, res) => ctrl.getByVendor(req, res));
router.get("/venues/:id", (req, res) => ctrl.getOne(req, res));
router.post("/venues", (req, res) => ctrl.create(req, res));
router.put("/venues/:id", (req, res) => ctrl.update(req, res));
router.delete("/venues/:id", (req, res) => ctrl.remove(req, res));

export default router;
