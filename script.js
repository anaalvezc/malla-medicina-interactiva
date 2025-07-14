let materias = [];
let materiasAprobadas = JSON.parse(localStorage.getItem("materiasAprobadas")) || [];

const contenedor = document.getElementById("contenedorMaterias");
const barra = document.getElementById("barraProgreso");
const textoProgreso = document.getElementById("progresoTexto");
const nav = document.getElementById("navegacion");
const TOTAL_CREDITOS = 741;

// Cargar materias desde el archivo materias.json
fetch("materias.json")
  .then(res => res.json())
  .then(data => {
    materias = data;
    crearNavegacion();
    mostrarMaterias(1); // Mostrar primero 1er año
    actualizarProgreso();
  });

// Crear botones de navegación por año
function crearNavegacion() {
  const anios = [...new Set(materias.map(m => m.anio))];
  anios.forEach(anio => {
    const btn = document.createElement("button");
    btn.textContent = `${anio}° Año`;
    btn.onclick = () => mostrarMaterias(anio);
    nav.appendChild(btn);
  });
  const btnInternado = document.createElement("button");
  btnInternado.textContent = "Internado";
  btnInternado.onclick = () => mostrarMaterias("Internado");
  nav.appendChild(btnInternado);
}

// Mostrar materias del año seleccionado
function mostrarMaterias(anio) {
  contenedor.innerHTML = "";

  const filtradas = materias.filter(m => m.anio === anio);
  filtradas.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("materia");
    div.innerHTML = `<strong>${m.nombre}</strong><br>${m.creditos} créditos`;

    if (!previasCumplidas(m)) {
      div.classList.add("tachada");
    }

    if (materiasAprobadas.includes(m.codigo)) {
      div.classList.add("aprobada");
    }

    div.onclick = () => toggleMateria(m.codigo);
    contenedor.appendChild(div);
  });
}

// Revisar si las previas están aprobadas
function previasCumplidas(materia) {
  if (!materia.previas || materia.previas.length === 0) return true;
  return materia.previas.every(p => materiasAprobadas.includes(p));
}

// Marcar o desmarcar como aprobada
function toggleMateria(codigo) {
  const index = materiasAprobadas.indexOf(codigo);
  if (index > -1) {
    materiasAprobadas.splice(index, 1);
  } else {
    materiasAprobadas.push(codigo);
  }
  localStorage.setItem("materiasAprobadas", JSON.stringify(materiasAprobadas));
  mostrarMaterias(getAnioActual());
  actualizarProgreso();
}

// Mostrar la barra de progreso
function actualizarProgreso() {
  let creditos = materias
    .filter(m => materiasAprobadas.includes(m.codigo))
    .reduce((sum, m) => sum + m.creditos, 0);

  barra.value = creditos;
  textoProgreso.textContent = `${creditos} / ${TOTAL_CREDITOS} créditos`;
}

// Saber en qué año estoy parada (para refrescar bien)
function getAnioActual() {
  const materiasVisibles = contenedor.querySelectorAll(".materia");
  if (materiasVisibles.length === 0) return 1;
  const nombre = materiasVisibles[0].querySelector("strong").textContent;
  const materia = materias.find(m => m.nombre === nombre);
  return materia?.anio || 1;
}
