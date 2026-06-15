// api route to fetch all australian states from the database
import { Router } from "express";
import { StateController } from "../controller/StateController";

const router = Router();
const stateController = new StateController();

router.get("/states", (req, res) => stateController.findAll(req, res));

export default router;
