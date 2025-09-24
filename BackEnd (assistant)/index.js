import express from "express"
import connectDB from "./config/db.js"
import dotenv from "dotenv"
import { getUsers, login, signup, updateUser } from "./controllers/user.js"
import { authenticate } from "./middleware/auth.js"
dotenv.config()

// checkings 



const app = express()

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World!🌏")
})

const PORT = process.env.PORT || 3000



// db connection

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

};

startServer();


// app.log
app.get('/getusers', authenticate, getUsers)
