const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* === ARCHIVO DE DATOS (JSON) === */
// Render BORRA archivos al reiniciar.
// Así que usamos un fallback especial:
const FILE = path.join(__dirname, "pedidos.json");

// Si no existe, crearlo vacío:
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "[]");
}

/* === FUNCIONES === */
function leerPedidos() {
  try {
    return JSON.parse(fs.readFileSync(FILE));
  } catch {
    return [];
  }
}

function guardarPedidos(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* === ENDPOINT: Obtener pedidos === */
app.get("/api/pedidos", (req, res) => {
  const pedidos = leerPedidos();
  res.json(pedidos);
});

/* === ENDPOINT: Crear pedido === */
app.post("/api/pedidos", (req, res) => {
  const pedidos = leerPedidos();

  const nuevoPedido = {
    id: Date.now(),             // ID único
    nombre: req.body.nombre,
    mesa: req.body.mesa,
    productos: req.body.productos,
    total: req.body.total,
    estado: "Pendiente",
    createdAt: new Date().toISOString(),
  };

  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);

  res.json({ mensaje: "Pedido registrado", pedido: nuevoPedido });
});

/* === ENDPOINT: Cambiar estado === */
app.put("/api/pedidos/:id", (req, res) => {
  const id = req.params.id;
  const pedidos = leerPedidos();

  const index = pedidos.findIndex(p => p.id == id);

  if (index === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  pedidos[index].estado = req.body.estado;
  guardarPedidos(pedidos);

  res.json({ mensaje: "Estado actualizado correctamente" });
});

/* === HEALTH CHECK PARA RENDER === */
app.get("/", (req, res) => {
  res.send("Servidor activo ✔ Sabor Apasionante");
});

/* === PUERTO RENDER === */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Servidor activo en puerto:", PORT);
});
