import { Router } from "express";
import { db } from "../firebaseAdmin.js";

const router = Router();

const pasta = (uid) => db.collection("usuarios").doc(uid);
const ref = (uid, nome) => pasta(uid).collection(nome);
const docConfig = (uid) => pasta(uid).collection("configuracoes").doc("geral");

const NOME_VALIDO = /^[a-zA-Z0-9_-]{1,40}$/;
const nomesValidos = (nomes) =>
  Array.isArray(nomes) &&
  nomes.every((n) => typeof n === "string" && NOME_VALIDO.test(n) && n !== "configuracoes");


const limpar = ({ id, ...resto } = {}) =>
  Object.fromEntries(Object.entries(resto).filter(([, v]) => v !== undefined));


const emPedacos = (lista, tamanho = 400) => {
  const out = [];
  for (let i = 0; i < lista.length; i += tamanho) out.push(lista.slice(i, i + tamanho));
  return out;
};

async function apagarColecoes(uid, nomes) {
  for (const nome of nomes) {
    const snap = await ref(uid, nome).get();
    for (const grupo of emPedacos(snap.docs)) {
      const lote = db.batch();
      grupo.forEach((d) => lote.delete(d.ref));
      await lote.commit();
    }
  }
}

async function gravarColecoes(uid, nomes, dados) {
  for (const nome of nomes) {
    const lista = Array.isArray(dados[nome]) ? dados[nome] : [];
    for (const grupo of emPedacos(lista)) {
      const lote = db.batch();
      grupo.forEach((item) => {
        const r = item.id ? ref(uid, nome).doc(String(item.id)) : ref(uid, nome).doc();
        lote.set(r, limpar(item));
      });
      await lote.commit();
    }
  }
  if (dados.config) await docConfig(uid).set(dados.config, { merge: true });
}

// aba de configurações
router.get("/configuracoes", async (req, res) => {
  try {
    const snap = await docConfig(req.uid).get();
    res.json(snap.exists ? snap.data() : null);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.put("/configuracoes", async (req, res) => {
  try {
    await docConfig(req.uid).set(req.body, { merge: true });
    res.json(req.body);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


router.post("/apagar-tudo", async (req, res) => {
  try {
    const { colecoes } = req.body;
    if (!nomesValidos(colecoes)) return res.status(400).json({ erro: "Coleções inválidas" });
    await apagarColecoes(req.uid, colecoes);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post("/substituir", async (req, res) => {
  try {
    const { colecoes, dados } = req.body;
    if (!nomesValidos(colecoes) || typeof dados !== "object" || !dados)
      return res.status(400).json({ erro: "Dados inválidos" });
    await apagarColecoes(req.uid, colecoes);
    await gravarColecoes(req.uid, colecoes, dados);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});


router.param("colecao", (req, res, next, nome) => {
  if (!NOME_VALIDO.test(nome) || nome === "configuracoes")
    return res.status(404).json({ erro: "Coleção inexistente" });
  next();
});

router.get("/:colecao", async (req, res) => {
  try {
    const snap = await ref(req.uid, req.params.colecao).get();
    res.json(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post("/:colecao", async (req, res) => {
  try {
    const dados = { ...limpar(req.body), createdAt: new Date().toISOString() };
    const doc = await ref(req.uid, req.params.colecao).add(dados);
    res.status(201).json({ ...dados, id: doc.id });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.put("/:colecao/:id", async (req, res) => {
  try {
    await ref(req.uid, req.params.colecao).doc(req.params.id).update(limpar(req.body));
    res.json({ ...limpar(req.body), id: req.params.id });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete("/:colecao/:id", async (req, res) => {
  try {
    await ref(req.uid, req.params.colecao).doc(req.params.id).delete();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

export default router;