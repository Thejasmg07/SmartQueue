import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware
app.use(cors(
    {
        origin: "http://localhost:5173",
    }
));
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("SmartQueue API running...");
});



// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});