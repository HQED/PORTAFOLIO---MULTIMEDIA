import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkh1fHGFArpWwBkNOqGfTNYuaSQ-bOQGA",
  authDomain: "db---portafolio---multimedia.firebaseapp.com",
  projectId: "db---portafolio---multimedia",
  storageBucket: "db---portafolio---multimedia.firebasestorage.app",
  messagingSenderId: "357260603224",
  appId: "1:357260603224:web:1dfc10a7796662a3b6bf2d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

console.log("Firebase conectado");


async function agregarItem(seccionId, input) {
    const lista = document.getElementById('lista-' + seccionId);
    const vacio = lista.querySelector('.vacio');

    if (vacio) vacio.remove();

    for (const file of input.files) {

        const archivoRef = ref(storage, `archivos/${file.name}`);

        await uploadBytes(archivoRef, file);

        const url = await getDownloadURL(archivoRef);

        await addDoc(collection(db, "archivos"), {
            nombre: file.name,
            url: url,
            seccion: seccionId
        });

        console.log("Archivo subido:", url);

        const li = document.createElement('li');

        li.className = 'item-archivo';

        const ext = file.name.split('.').pop().toLowerCase();

        const icono = obtenerIcono(file.name);

        let previewHtml = '';

        if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) {

            previewHtml = `
                <div class="item-preview">
                    <img src="${url}" alt="${file.name}">
                </div>
            `;

        } else if (['mp4','webm','avi','mov','mkv','ogg'].includes(ext)) {

            previewHtml = `
                <div class="item-preview">
                    <video controls src="${url}"></video>
                </div>
            `;

        } else if (ext === 'pdf') {

            previewHtml = `
                <div class="item-preview">
                    <iframe src="${url}"></iframe>
                </div>
            `;

        } else {

            previewHtml = `
                <div class="item-preview">
                    <span class="placeholder">📄</span>
                </div>
            `;
        }

        li.innerHTML = `
            <div class="item-header">
                <span class="nombre">${icono} ${file.name}</span>

                <div class="item-acciones">

                    <button class="btn btn-maximizar" onclick="maximizarVistaPrevia(this)">
                        Maximizar
                    </button>

                    <a class="btn btn-descargar" href="${url}" download="${file.name}">
                        Descargar
                    </a>

                    <button class="btn btn-eliminar" onclick="eliminarItem(this)">
                        &times;
                    </button>

                </div>
            </div>

            ${previewHtml}
        `;

        lista.appendChild(li);
    }

    input.value = '';

    if (lista.children.length === 0) {
        lista.innerHTML = '<li class="vacio">No hay elementos a&uacute;n</li>';
    }
}

function eliminarItem(boton) {
    const li = boton.closest('.item-archivo');
    const lista = li.parentElement;
    li.remove();
    if (lista.children.length === 0) {
        lista.innerHTML = '<li class="vacio">No hay elementos a&uacute;n</li>';
    }
}

function obtenerIcono(nombre) {
    const ext = nombre.split('.').pop().toLowerCase();
    if (['ppt','pptx','key','odp'].includes(ext)) return '📊';
    if (['pdf'].includes(ext)) return '📕';
    if (['mp4','webm','avi','mov','mkv','ogg'].includes(ext)) return '🎬';
    if (['sb','sb2','sb3'].includes(ext)) return '🐱';
    if (['aia'].includes(ext)) return '📱';
    if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) return '🖼️';
    if (['txt','html','css','js','json','xml','md','csv'].includes(ext)) return '📄';
    return '📄';
}

function maximizarVistaPrevia(boton) {
    const item = boton.closest('.item-archivo');
    const nombre = item.querySelector('.nombre').textContent.trim();
    const preview = item.querySelector('.item-preview');
    const img = preview.querySelector('img');
    const video = preview.querySelector('video');
    const iframe = preview.querySelector('iframe');
    const placeholder = preview.querySelector('.placeholder');
    const textoDiv = preview.querySelector('.code-preview');

    const modal = document.getElementById('modal');
    const modalNombre = document.getElementById('modal-nombre');
    const modalBody = document.getElementById('modal-body');

    modalNombre.textContent = nombre;
    modalBody.innerHTML = '';

    if (img) {
        const clon = img.cloneNode(true);
        clon.style.maxWidth = '100%';
        clon.style.maxHeight = '85vh';
        modalBody.appendChild(clon);
    } else if (video) {
        const clon = video.cloneNode(true);
        clon.controls = true;
        clon.style.maxWidth = '100%';
        clon.style.maxHeight = '85vh';
        modalBody.appendChild(clon);
        clon.play();
    } else if (iframe) {
        const clon = iframe.cloneNode(true);
        clon.style.width = '100%';
        clon.style.height = '85vh';
        modalBody.appendChild(clon);
    } else if (textoDiv) {
        const pre = document.createElement('pre');
        pre.className = 'modal-texto';
        pre.textContent = textoDiv.textContent;
        modalBody.appendChild(pre);
    } else if (placeholder) {
        const span = document.createElement('span');
        span.className = 'modal-placeholder';
        span.textContent = placeholder.textContent;
        modalBody.appendChild(span);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal(event) {
    const modal = document.getElementById('modal');
    if (event && event.target !== modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    const modalBody = document.getElementById('modal-body');
    const video = modalBody.querySelector('video');
    if (video) video.pause();
    modalBody.innerHTML = '';
}

function toggleModoOscuro() {
    const body = document.body;
    const btn = document.getElementById('toggle-dark');
    body.classList.toggle('dark');
    const oscuro = body.classList.contains('dark');
    btn.innerHTML = oscuro ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    localStorage.setItem('modo-oscuro', oscuro);
}

(function cargarModo() {
    if (localStorage.getItem('modo-oscuro') === 'true') {
        document.body.classList.add('dark');
        document.getElementById('toggle-dark').innerHTML = '☀️ Modo Claro';
    }
})();

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal.classList.contains('active')) cerrarModal();
    }
});

// ─── NAVEGACIÓN ───

function ocultarTodas() {
    document.querySelectorAll('.vista').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
}

function mostrarInicio() {
    ocultarTodas();
    document.getElementById('vista-inicio').style.display = 'block';
    document.getElementById('nav-inicio').classList.add('active');
}

function mostrarCorte1() {
    ocultarTodas();
    document.getElementById('vista-corte1').style.display = 'block';
    document.getElementById('nav-corte1').classList.add('active');
}

function mostrarCorte2() {
    ocultarTodas();
    document.getElementById('vista-corte2').style.display = 'block';
    document.getElementById('nav-corte2').classList.add('active');
    renderEmbeds();
    renderLinksInventor();
}

// ─── SCRATCH EMBEDS ───

function obtenerEmbeds() {
    const data = localStorage.getItem('scratch-embeds');
    return data ? JSON.parse(data) : [];
}

function guardarEmbeds(embeds) {
    localStorage.setItem('scratch-embeds', JSON.stringify(embeds));
}

function agregarEmbed() {
    const input = document.getElementById('embed-input');
    const codigo = input.value.trim();
    if (!codigo) return;

    const srcMatch = codigo.match(/src=["']([^"']+)["']/);
    if (!srcMatch) {
        alert('No se encontró un src válido en el código embed. Asegúrate de pegar el iframe completo.');
        return;
    }

    const src = srcMatch[1];
    const embeds = obtenerEmbeds();
    embeds.push({ src, id: Date.now() });
    guardarEmbeds(embeds);
    input.value = '';
    renderEmbeds();
}

function eliminarEmbed(id) {
    const embeds = obtenerEmbeds().filter(e => e.id !== id);
    guardarEmbeds(embeds);
    renderEmbeds();
}

function renderEmbeds() {
    const grid = document.getElementById('scratch-grid');
    const embeds = obtenerEmbeds();
    grid.innerHTML = '';

    if (embeds.length === 0) {
        grid.innerHTML = '<p class="vacio">No hay proyectos Scratch aún. Pega un código embed arriba para agregar uno.</p>';
        return;
    }

    for (const e of embeds) {
        const card = document.createElement('div');
        card.className = 'scratch-card';
        card.innerHTML = `
            <div class="scratch-card-header">
                <span>🐱 Proyecto Scratch</span>
                <button class="btn-eliminar-embed" onclick="eliminarEmbed(${e.id})">&times;</button>
            </div>
            <div class="scratch-card-body">
                <iframe src="${e.src}" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
            </div>
        `;
        grid.appendChild(card);
    }
}

// ─── APP INVENTOR ───

function obtenerLinksInventor() {
    const data = localStorage.getItem('inventor-links');
    return data ? JSON.parse(data) : [];
}

function guardarLinksInventor(links) {
    localStorage.setItem('inventor-links', JSON.stringify(links));
}

function agregarLinkInventor() {
    const input = document.getElementById('inventor-link-input');
    const url = input.value.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Ingresa una URL válida que comience con http:// o https://');
        return;
    }

    const links = obtenerLinksInventor();
    links.push({ url, id: Date.now() });
    guardarLinksInventor(links);
    input.value = '';
    renderLinksInventor();
}

function eliminarLinkInventor(id) {
    const links = obtenerLinksInventor().filter(l => l.id !== id);
    guardarLinksInventor(links);
    renderLinksInventor();
}

function renderLinksInventor() {
    const container = document.getElementById('inventor-links');
    const links = obtenerLinksInventor();
    container.innerHTML = '';

    if (links.length === 0) return;

    for (const l of links) {
        const card = document.createElement('div');
        card.className = 'inventor-link-card';
        card.innerHTML = `
            <span class="inventor-link-url">🔗 ${l.url}</span>
            <div class="inventor-link-acciones">
                <a class="btn btn-descargar" href="${l.url}" target="_blank" rel="noopener">Abrir</a>
                <button class="btn btn-eliminar" onclick="eliminarLinkInventor(${l.id})">&times;</button>
            </div>
        `;
        container.appendChild(card);
    }
}

// ─── INICIALIZAR ───

(function init() {
    const embeds = obtenerEmbeds();
    if (embeds.length === 0) {
        guardarEmbeds([{ src: 'https://scratch.mit.edu/projects/1320425607/embed', id: Date.now() }]);
    }
})();

// Exponer funciones al ámbito global para los onclick del HTML
window.mostrarInicio = mostrarInicio;
window.mostrarCorte1 = mostrarCorte1;
window.mostrarCorte2 = mostrarCorte2;
window.toggleModoOscuro = toggleModoOscuro;
window.agregarItem = agregarItem;
window.eliminarItem = eliminarItem;
window.maximizarVistaPrevia = maximizarVistaPrevia;
window.cerrarModal = cerrarModal;
window.agregarEmbed = agregarEmbed;
window.eliminarEmbed = eliminarEmbed;
window.agregarLinkInventor = agregarLinkInventor;
window.eliminarLinkInventor = eliminarLinkInventor;
window.renderEmbeds = renderEmbeds;
window.renderLinksInventor = renderLinksInventor;
