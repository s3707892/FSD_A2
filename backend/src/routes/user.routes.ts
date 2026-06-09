import { Router } from "express";
import { UserController } from "../controller/UserController";

const router = Router();
const userController = new UserController();

// Get all users
router.get("/users", (req, res) =>
  userController.findAll(req, res)
);

//  Get a specific user
router.get("/users/:id", (req, res) =>
  userController.findOne(req, res)
);

//  Check a user by email and password for login
router.post("/users/login", (req, res) =>
  userController.checkLogin(req, res)
);

// Create a new user
router.post("/users", (req, res) =>
  userController.create(req, res)
);

router.put("/users/:id", (req, res) =>
  userController.update(req, res)
);

/**  Delete a specific user

// Delete a specific user
router.delete("/users/:id", (req, res) =>
  userController.delete(req, res)
);*/

export default router;

