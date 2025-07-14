let materias = [];
let materiasAprobadas = JSON.parse(localStorage.getItem("materiasAprobadas")) || [];

const contenedor = document.getElementById("contenedorMaterias");
const barra = document.getElementById("barraProgreso");
const textoProgreso = document.getElementById("progresoTexto");
const nav = document.getElementById("navegacion");
const TOTAL_CREDITOS = 741;

fetch("materias.json")
  .then(res => res.json())
  .then(data => {
    materias = data;
    crearNavegacion();
    mostrarMaterias(1);
    actualizarProgreso();
  });

function crearNavegacion() {
  const anios = [...new Set(materias.map(m => m.anio))].sort((a, b) => {
    if (a === "Internado") return 1;
    if (b === "Internado") return -1;
    return a - b;
  });

  anios.forEach(anio => {
    const btn = document.createElement("button");
    btn.textContent = anio === "Internado" ? "Internado" : `${anio}° Año`;
    btn.onclick = () => mostrarMaterias(anio);
    nav.appendChild(btn);
  });
}

function mostrarMaterias(anio) {
  contenedor.innerHTML = "";

  const filtradas = materias.filter(m => m.anio === anio);
  filtradas.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("materia");
    div.innerHTML = `<strong>${m.nombre}</strong><br>${m.creditos} créditos`;

    const estaAprobada = materiasAprobadas.includes(m.codigo);
    const tienePrevias = previasCumplidas(m);
    const cumpleEspecial = requisitosEspecialesCumplidos(m);

    if (estaAprobada) {
      div.classList.add("aprobada");
    } else if (!tienePrevias || !cumpleEspecial) {
      div.classList.add("tachada");
    }

    div.onclick = () => toggleMateria(m.codigo);
    contenedor.appendChild(div);
  });
}

function previasCumplidas(materia) {
  if (!materia.previas || materia.previas.length === 0) return true;
  return materia.previas.every(p => materiasAprobadas.includes(p));
}

function requisitosEspecialesCumplidos(materia) {
  if (!materia.requisitosEspeciales) return true;

  if (materia.requisitosEspeciales.tipo === "condicional") {
    const tieneBioestadistica = materiasAprobadas.includes("MIBES");
    const posibles = ["MBCM", "MAT2", "MANAT", "MHBIO", "HIST", "BCC3N", "BCC4C", "BCC5", "BCC6"];
    const algunaMas = posibles.some(cod => materiasAprobadas.includes(cod));
    return tieneBioestadistica && algunaMas;
  }

  return true;
}

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

function actualizarProgreso() {
  let creditos = materias
    .filter(m => materiasAprobadas.includes(m.codigo))
    .reduce((sum, m) => sum + m.creditos, 0);

  barra.value = creditos;
  textoProgreso.textContent = `${creditos} / ${TOTAL_CREDITOS} créditos`;
}

function getAnioActual() {
  const visibles = contenedor.querySelectorAll(".materia");
  if (visibles.length === 0) return 1;
  const nombre = visibles[0].querySelector("strong").textContent;
  const materia = materias.find(m => m.nombre === nombre);
  return materia?.anio || 1;
}

document.getElementById("resetear").onclick = () => {
  if (confirm("¿Estás segura de que querés borrar todo?")) {
    localStorage.removeItem("materiasAprobadas");
    materiasAprobadas = [];
    mostrarMaterias(getAnioActual());
    actualizarProgreso();
  }
};

document.getElementById("agregarOptativa").onclick = () => {
  const nombre = prompt("Nombre de la materia:");
  if (!nombre) return;

  const creditos = parseInt(prompt("¿Cuántos créditos otorga?"));
  if (isNaN(creditos)) return;

  const nueva = {
    codigo: "OPT" + Date.now(),
    nombre,
    anio: getAnioActual(),
    semestre: 1,
    creditos,
    previas: []
  };

  materias.push(nueva);
  materiasAprobadas.push(nueva.codigo);
  localStorage.setItem("materiasAprobadas", JSON.stringify(materiasAprobadas));
  mostrarMaterias(getAnioActual());
  actualizarProgreso();
};
