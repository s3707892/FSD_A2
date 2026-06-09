import { Router } from "express";
import { SuitabilityController } from "../controller/SuitabilityController";

const router = Router();
const suitabilityController = new SuitabilityController();

//  Get all suitabilities
router.get("/suitability", (req, res) =>
  suitabilityController.findAll(req, res)
);




export default router;