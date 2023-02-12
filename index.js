import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express()

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;
const CONNECTION_URL = process.env.CONNECTION_URL;

// To get confirmation from cyclic.sh that the server is hosted properly in the cyclic.
app.get("/",(req,res) =>{
    res.send("<h1>Auth system App hosted successfully in cyclic.sh</h1>")
})

// Set the defaut route
app.use("/api/v1/auth", authRoutes);

// To resolve the warning of the buffer: false issue.
mongoose.set("strictQuery", false);
mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => app.listen(PORT, () => console.log(`server is running in : http://localhost:${PORT}`)))
.catch((err) => console.log(`Can't able to connect: ${err}`));