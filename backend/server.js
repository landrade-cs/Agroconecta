import "dotenv/config";
import express from "express";
import cors from "cors";
import { verificarLogin } from "./middleware/auth.js";
import dados from "./routes/dados.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => res.json({ status: "API AgroConecta no ar" }));
app.use("/api", verificarLogin, dados);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});