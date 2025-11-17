const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ⭐ Servir archivos estáticos (HTML, imágenes, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Archivo JSON donde se guardan los pedidos
const FILE = path.join(__dirname, "pedidos.json");

// Crear archivo si no existe
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "[]");
}

/* === Leer pedidos === */
function leerPedidos() {
  try {
    return JSON.parse(fs.readFileSync(FILE));
  } catch {
    return [];
  }
}

/* === Guardar pedidos === */
function guardarPedidos(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* === API: Obtener pedidos === */
app.get("/api/pedidos", (req, res) => {
  res.json(leerPedidos());
});

/* === API: Crear pedido === */
app.post("/api/pedidos", (req, res) => {
  const pedidos = leerPedidos();

  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre,
    mesa: req.body.mesa,
    productos: req.body.productos,
    total: req.body.total,
    estado: "Pendiente",
    createdAt: new Date().toISOString(),
  };

  pedidos.push(nuevo);
  guardarPedidos(pedidos);

  res.json({ mensaje: "Pedido registrado", pedido: nuevo });
});

/* === API: Cambiar estado === */
app.put("/api/pedidos/:id", (req, res) => {
  const pedidos = leerPedidos();
  const id = req.params.id;

  const idx = pedidos.findIndex((p) => p.id == id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado" });

  pedidos[idx].estado = req.body.estado;
  guardarPedidos(pedidos);

  res.json({ mensaje: "Estado actualizado" });
});

/* === Página inicial === */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

/* === Puerto Render === */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Servidor activo en puerto:", PORT);
});
