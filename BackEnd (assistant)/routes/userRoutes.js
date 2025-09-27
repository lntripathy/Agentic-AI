import express from "express"
import { getUsers, login, signup, updateUser, logout } from "./controllers/user.js"
import { authenticate } from "./middleware/auth.js"
import { Router } from "express"



const router = express.Router();

router.post("/singup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.get("/get-users", authenticate, getUsers)
router.post("/update-user", authenticate, updateUser)

export default router


