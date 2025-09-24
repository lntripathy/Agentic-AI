import bcrypt from "bcrypt"
import User from "../models/user.model.js"
import { inngest } from "../inngest/client.js"
import dotenv from "dotenv"
dotenv.config()
import jwt from "jsonwebtoken"



export const signup = async (req, res) => {
    const { email, password, skills = [] } = req.body
    try {
        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ email, password: hashed, skills })

        // firing inngest event

        await inngest.send({
            name: "user/signup",
            data: {
                email
            }
        })

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET)

        res.json({ user, token })

    } catch (error) {
        res.status(500).json({ error: "Signup Failed", datails: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user)
            return res.status(401).json({ error: "User not found." })

        const isMatch = bcrypt.compare(password, user.passwrod)

        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" })


        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
        )

        res.json({ user, token, message: "User Logged In Successfully!" })


    } catch (error) {
        res.status(500).json({ error: "Login Failed", details: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token)
            return res.status(401).json({ error: "Unauthorzed" });
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                return res.status(401).json({ error: "Unauthorized" });
        });
        res.json({ message: "Logout successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Login failed",
            details: error.message
        });
    }
}

export const updateUser = async (req, res) => {
    const { skills = [], role, email } = req.body
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: "User not found" })
        }
        await User.updateOne(
            { email },
            { $set: { skills: skills.length ? skills : user.skills }, role }
        )
        return res.json({ message: "User updated successfully" })
    } catch (error) {
        res.status(500).json({ error: "Login failed", details: error.message })
    }
}

export const getUsers = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" })
        }
        const user = await User.find().select("-password");
        return res.json(user)
    } catch (error) {
        return res.status(500).json({
            error: "update failed",
            details: error.message,
        })
    }
}
