// Lista de usernames e senhas
const users = [
    { username: "admin", password: "admin" },
    { username: "user2", password: "password2" },
    { username: "tiago", password: "tiago" },
    { username: "jose da silva", password: "jose" },
    // Adicione mais usuários conforme necessário
];

// Função para verificar as credenciais e redirecionar para app.html se forem válidas
function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        localStorage.setItem("username", username);
        window.location.href = "app.html";
    } else {
        alert("Username or password incorrect. Please try again.");
    }
}

// Função para logout
function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

// Função para salvar o marcador
function saveMarker(map, layer, title, description, createdBy) {
    // Criar conteúdo do pop-up do marcador
    const popupContent = `
        <b>Título:</b> ${title}<br>
        <b>Descrição:</b> ${description}<br>
        <b>Criado por:</b> ${createdBy}<br>
        <b>Criado em:</b> ${new Date().toLocaleString()}<br><br>
        <button id="closePopupBtn">OK</button>
        ${createdBy === localStorage.getItem('username') ? '<button id="deleteMarkerBtn">Deletar Marcador</button>' : ''}
    `;

    // Definir conteúdo do pop-up do marcador
    layer.bindPopup(popupContent).openPopup();

    // Adicionar o marcador ao mapa
    map.addLayer(layer);

    // Configurar eventos do popup
    layer.on('popupopen', function () {
        document.getElementById('closePopupBtn').addEventListener('click', function () {
            map.closePopup();
        });

        if (createdBy === localStorage.getItem('username')) {
            document.getElementById('deleteMarkerBtn').addEventListener('click', function () {
                deleteMarker(layer);
            });
        }
    });

    // Salvar as informações do marcador em localStorage
    const markers = JSON.parse(localStorage.getItem('markers')) || [];
    markers.push({
        latlng: layer.getLatLng(),
        title: title,
        description: description,
        createdBy: createdBy,
        createdAt: new Date().toLocaleString()
    });
    localStorage.setItem('markers', JSON.stringify(markers));
}

// Função para deletar o marcador
function deleteMarker(layer) {
    const markers = JSON.parse(localStorage.getItem('markers')) || [];
    const latlng = layer.getLatLng();
    const index = markers.findIndex(marker => marker.latlng.lat === latlng.lat && marker.latlng.lng === latlng.lng);
    if (index !== -1) {
        markers.splice(index, 1);
        localStorage.setItem('markers', JSON.stringify(markers));
        map.removeLayer(layer);
    }
}

// Verificar se o usuário está logado ao carregar app.html
if (window.location.pathname.includes("app.html")) {
    const username = localStorage.getItem("username");
    if (username) {
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById("usernameDisplay").innerText = username;

            // Inicializar o mapa
            const map = L.map('map').setView([51.505, -0.09], 13);

            // Adicionar camada de azulejos OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Adicionar plugin Leaflet.draw ao mapa
            const drawControl = new L.Control.Draw({
                draw: {
                    marker: true, // Permitir desenhar marcadores
                },
            });
            map.addControl(drawControl);

            // Ouvir evento de criação de marcador
            map.on('draw:created', function (e) {
                const layer = e.layer;

                // Abrir Sweet Alert para preencher os campos
                Swal.fire({
                    title: 'Preencha os dados do marcador',
                    html:
                        '<input id="swal-input1" class="swal2-input" placeholder="Título">' +
                        '<input id="swal-input2" class="swal2-input" placeholder="Descrição">',
                    showCancelButton: true,
                    confirmButtonText: 'Salvar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const title = document.getElementById('swal-input1').value;
                        const description = document.getElementById('swal-input2').value;
                        saveMarker(map, layer, title, description, username); // Passar o nome do usuário como argumento
                    }
                });
            });

            // Carregar os marcadores salvos em localStorage ao carregar a página
            const markers = JSON.parse(localStorage.getItem('markers')) || [];
            markers.forEach(function (marker) {
                const markerLayer = L.marker(marker.latlng);
                saveMarker(map, markerLayer, marker.title, marker.description, marker.createdBy); // Passar createdBy como argumento
            });
        });
    } else {
        // Se não estiver logado, redirecionar para a página de login
        window.location.href = "index.html";
    }
}

// Adicionar o ouvinte de evento para o formulário de login
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    // Verificar se é a primeira vez que index.html é carregado
    const isFirstLoad = localStorage.getItem('firstLoad') === null;
    if (isFirstLoad) {
        localStorage.removeItem('markers');
        localStorage.setItem('firstLoad', 'false');
    }
});