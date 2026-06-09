import { Router } from "express";
import { ShortlistController } from "../controller/ShortlistController";

const router = Router();
const shortlistController = new ShortlistController();



//  Get shortlist of a specific user
router.get("/shortlist/:id", (req, res) =>
  shortlistController.findAll(req, res)
);



// Add item to shortlist
router.post("/shortlist", (req, res) =>
  shortlistController.create(req, res)
);

router.delete("/shortlist", (req, res) =>
  shortlistController.remove(req, res)
);

router.post("/shortlist/moveup", (req, res) =>
  shortlistController.moveUp(req, res)
)

router.post("/shortlist/movedown", (req, res) =>
  shortlistController.moveDown(req, res)
)

export default router;