const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// Archivo JSON donde se guardan los pedidos
const FILE = path.join(__dirname, "pedidos.json");

/* Leer archivo */
function leerPedidos() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

/* Guardar archivo */
function guardarPedidos(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* Obtener todos los pedidos */
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
  if (idx === -1) return res.status(404).json({ error: "No encontrado" });

  pedidos[idx].estado = req.body.estado;
  guardarPedidos(pedidos);

  res.json({ mensaje: "Estado actualizado" });
});

/* ⭐ Ruta inicial: Mostrar home.html */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

/* Render usa process.env.PORT */
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`🔥 Servidor activo en el puerto ${PORT}`);
});
