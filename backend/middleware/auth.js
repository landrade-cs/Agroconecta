import { auth } from "../firebaseAdmin.js";

export async function verificarLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");

  if (!token) return res.status(401).json({ erro: "Token ausente" });

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (erro) {
    res.status(401).json({ erro: "Token inválido" });
  }
}
