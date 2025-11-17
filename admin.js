/***********************
 *  CONFIG GLOBAL
 ************************/

const API = "https://restaurante-enpz.onrender.com";   // Back-end Render
const ENDPOINT = `${API}/api/pedidos`;


/***********************
 *    LOGIN ADMIN
 ************************/
document.getElementById("btn-login").onclick = () => {
  const pass = document.getElementById("admin-pass").value;
  if (pass === "admin123") {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("panel").style.display = "block";
    cargarPedidos();
    setInterval(cargarPedidos, 3000); // auto-refresh
  } else {
    alert("Contraseña incorrecta");
  }
};


/***********************
 *    CARGAR PEDIDOS
 ************************/
function cargarPedidos() {
  fetch(ENDPOINT)
    .then(r => r.json())
    .then(data => {
      data.reverse(); // últimos pedidos arriba
      renderPedidos(data);
    })
    .catch(() => {
      console.log("Error obteniendo pedidos");
    });
}


/***********************
 *   RENDER PEDIDOS
 ************************/
function renderPedidos(lista) {
  const cont = document.getElementById("orders");
  cont.innerHTML = "";

  lista.forEach(p => {
    const productosHTML = p.productos
      .map(x => `<div>- ${x.nombre} ($${x.precio.toLocaleString()})</div>`)
      .join("");

    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <strong>${p.nombre}</strong> - Mesa ${p.mesa}<br>
      <small>${new Date(p.createdAt).toLocaleString()}</small>
      <hr>
      ${productosHTML}
      <hr>
      <b>Total: </b>$${p.total.toLocaleString()}<br><br>

      <div class="estado-container">
        ${renderBotonEstado(p, "Pendiente")}
        ${renderBotonEstado(p, "Preparando")}
        ${renderBotonEstado(p, "Listo")}
        ${renderBotonEstado(p, "Entregado")}
      </div>

      <div class="estado-actual">
        <small>Estado actual: <b style="color:#fede00">${p.estado}</b></small>
      </div>
    `;

    cont.appendChild(card);
  });
}


/***********************
 *   BOTONES DE ESTADO
 ************************/
function renderBotonEstado(pedido, estado) {
  const clases = {
    "Pendiente": "pendiente",
    "Preparando": "preparando",
    "Listo": "listo",
    "Entregado": "entregado",
  };

  const activo = pedido.estado === estado ? "border:2px solid white;" : "";

  return `
    <span 
      class="estado-btn ${clases[estado]}" 
      style="${activo}"
      onclick="cambiarEstado('${pedido.id}','${estado}')"
    >
      ${estado}
    </span>
  `;
}


/***********************
 *  CAMBIAR ESTADO
 ************************/
function cambiarEstado(id, estado) {
  fetch(`${ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  })
    .then(r => r.json())
    .then(() => {
      animacionEstado();
      cargarPedidos();
    });
}


/***********************
 *  ANIMACIÓN VISUAL
 ************************/
function animacionEstado() {
  const body = document.body;
  body.style.transition = "background .2s";
  body.style.background = "#222";

  setTimeout(() => {
    body.style.background = "#0d0d0d";
  }, 200);
}


/***********************
 *    GENERAR QR
 ************************/
document.getElementById("btn-gen").onclick = () => {
  const mesa = document.getElementById("mesa-num").value;

  if (!mesa) {
    return alert("Debes ingresar un número de mesa");
  }

  const url = `${API}/menu.html?mesa=${mesa}`;

  document.getElementById("qr-box").hidden = false;
  document.getElementById("qr-url").textContent = url;

  document.getElementById("qrcode").innerHTML = "";

  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 200,
    height: 200
  });
};
