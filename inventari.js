// inventari.js - inventario central con persistencia localStorage

const defaultInventory = [
  { nombre: 'Tomate', cantidadDisponible: 100, umbralMinimo: 10 },
  { nombre: 'Queso Mozzarella', cantidadDisponible: 50, umbralMinimo: 8 },
  { nombre: 'Queso Cheddar', cantidadDisponible: 30, umbralMinimo: 8 },
  { nombre: 'Pan', cantidadDisponible: 100, umbralMinimo: 20 },
  { nombre: 'Carne de Res', cantidadDisponible: 2000, umbralMinimo: 200 },
  { nombre: 'Pechuga de Pollo', cantidadDisponible: 1000, umbralMinimo: 100 },
  { nombre: 'Tortillas', cantidadDisponible: 200, umbralMinimo: 50 },
  { nombre: 'Espaguetis', cantidadDisponible: 200, umbralMinimo: 30 },
  { nombre: 'Lechuga Romana', cantidadDisponible: 50, umbralMinimo: 10 },
  { nombre: 'Queso Parmesano', cantidadDisponible: 30, umbralMinimo: 5 },
  { nombre: 'Salsa César', cantidadDisponible: 50, umbralMinimo: 10 }
];

// Inicializar inventario en localStorage si no existe
function getInventory(){
  const inv = JSON.parse(localStorage.getItem('inventory') || 'null');
  if(!inv){ localStorage.setItem('inventory', JSON.stringify(defaultInventory)); return JSON.parse(localStorage.getItem('inventory')); }
  return inv;
}

function setInventory(inv){ localStorage.setItem('inventory', JSON.stringify(inv)); }

// Obtener lista de compra
function generarListaCompra(){
  const inv = getInventory();
  return inv.filter(i=>i.cantidadDisponible < i.umbralMinimo);
}

// Restar ingredientes según un pedido (order.productos contiene ingredientes en cada producto)
function procesarRestasPorPedido(productos){
  // productos: array con {nombre, ingredientes:[{nombre,cantidad}...]}
  const inv = getInventory();
  productos.forEach(p=>{
    if(!p.ingredientes) return;
    p.ingredientes.forEach(ing=>{
      const obj = inv.find(x=>x.nombre.toLowerCase()===ing.nombre.toLowerCase());
      if(obj){
        // algunos platos tienen cantidades en gramos (ej 150) y el umbral/inventario está en unidades; asumimos que ambos son compatibles
        obj.cantidadDisponible = Math.max(0, obj.cantidadDisponible - (ing.cantidad || 0));
      }
    });
  });
  setInventory(inv);
}

// Escuchar eventos en localStorage (cuando otro tab/ventana agrega un pedido)
window.addEventListener('storage', (e)=>{
  if(e.key === 'events'){
    // recargar eventos y procesar nuevos pedidos (si existe orders)
    const events = JSON.parse(localStorage.getItem('events')||'[]');
    // procesar eventos 'new_order' marcados no procesados; para simplicidad: mantenemos un array processedEventIds
    const processed = JSON.parse(localStorage.getItem('processedEvents')||'[]');
    let changed=false;
    events.forEach(ev=>{
      if(ev.type==='new_order' && !processed.includes(ev.timestamp)){
        // obtener orden y procesar restas
        const orders = JSON.parse(localStorage.getItem('orders')||'[]');
        const order = orders.find(o=>o.id === ev.orderId);
        if(order){
          procesarRestasPorPedido(order.productos);
          // opcional: marcar evento procesado
          processed.push(ev.timestamp);
          localStorage.setItem('processedEvents', JSON.stringify(processed));
          changed=true;
        }
      }
    });
    if(changed){
      // opcional: notificar o actualizar UI si hay
      console.log('Inventario actualizado por eventos entrantes.');
    }
  }
});

// También procesar any existing unprocessed events on load:
(function processExisting(){
  const events = JSON.parse(localStorage.getItem('events')||'[]');
  const processed = JSON.parse(localStorage.getItem('processedEvents')||'[]');
  let changed=false;
  events.forEach(ev=>{
    if(ev.type==='new_order' && !processed.includes(ev.timestamp)){
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      const order = orders.find(o=>o.id === ev.orderId);
      if(order){ procesarRestasPorPedido(order.productos); processed.push(ev.timestamp); changed=true; }
    }
  });
  if(changed) localStorage.setItem('processedEvents', JSON.stringify(processed));
})();
