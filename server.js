const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

/* 👇 IMPORTANTE: Render debe servir TODOS los archivos HTML, JS, imágenes, etc */
app.use(express.static(__dirname));

/* Archivo JSON */
const FILE = path.join(__dirname, "pedidos.json");

/* Leer pedidos */
function leerPedidos() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

/* Guardar pedidos */
function guardarPedidos(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* Obtener pedidos */
app.get("/api/pedidos", (req, res) => {
  res.json(leerPedidos());
});

/* Crear pedido */
app.post("/api/pedidos", (req, res) => {
  const pedidos = leerPedidos();

  const nuevo = {
    ...req.body,
    estado: "Pendiente",
    createdAt: new Date().toISOString(),
  };

  pedidos.push(nuevo);
  guardarPedidos(pedidos);

  res.json({ mensaje: "Pedido registrado", pedido: nuevo });
});

/* Cambiar estado */
app.put("/api/pedidos/:id", (req, res) => {
  const pedidos = leerPedidos();
  const id = req.params.id;

  const idx = pedidos.findIndex((p) => p.id == id);
  if (idx === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  pedidos[idx].estado = req.body.estado;
  guardarPedidos(pedidos);

  res.json({ mensaje: "Estado actualizado" });
});

/* 👇 Página principal para Render */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

/* Puerto Render */
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`🔥 Servidor activo en puerto ${PORT}`);
});
