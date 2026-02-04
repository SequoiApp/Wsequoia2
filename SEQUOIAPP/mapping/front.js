document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // Empêche le navigateur d’ouvrir les fichiers
    // ===============================
    document.addEventListener("dragover", e => e.preventDefault());
    document.addEventListener("drop", e => e.preventDefault());

    // ===============================
    // Carte Leaflet
    // ===============================
    const carte = L.map("map", {
        center: [48.8566, 2.3522],
        zoom: 8,
        zoomControl: false
    });

    var right_sidebar = L.control.sidebar({
        autopan: true,
        closeButton: true,
        container: 'sidebar-right',
        position: 'right'
    }).addTo(carte);   // ✔️ correction ici

    right_sidebar.open('waypoints');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
        foo: 'bar',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(carte);

    L.control.zoom({ position: "bottomright" }).addTo(carte);
    // ===============================
    // Drag & Drop GeoJSON avec overlay
    // ===============================
    const mapDiv = document.getElementById("map");
    const overlay = document.getElementById("drop-overlay");

    // Feedback visuel : montre le voile pendant le drag
    mapDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        mapDiv.classList.add("dragover"); // optionnel
        overlay.classList.add("show");    // montre le voile
    });

    mapDiv.addEventListener("dragleave", (e) => {
        e.preventDefault();
        mapDiv.classList.remove("dragover");
        overlay.classList.remove("show"); // masque le voile
    });

    mapDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        mapDiv.classList.remove("dragover");
        overlay.classList.remove("show"); // masque le voile

        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (!file.name.match(/\.(geojson|json)$/i)) {
            alert("Veuillez déposer un fichier GeoJSON");
            return;
        }

        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const geojson = JSON.parse(evt.target.result);
                console.log("GeoJSON chargé", geojson);

                let layer;

                // Si CRS = EPSG:2154, on reprojette les coordonnées
                const is2154 = geojson.crs && geojson.crs.properties &&
                            geojson.crs.properties.name.includes("2154");

                layer = L.geoJSON(geojson, {
                    coordsToLatLng: is2154
                        ? (coords) => {
                            const [x, y] = coords;
                            const [lng, lat] = proj4('EPSG:2154', 'EPSG:4326', [x, y]);
                            return L.latLng(lat, lng);
                        }
                        : undefined, // Leaflet gère EPSG:4326 nativement
                    style: { color: "#ff0000", weight: 2 },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            layer.bindPopup("<pre>" + JSON.stringify(feature.properties, null, 2) + "</pre>");
                        }
                    }
                }).addTo(carte);

                carte.fitBounds(layer.getBounds());

            } catch (err) {
                console.error("GeoJSON invalide", err);
                alert("Erreur : GeoJSON invalide");
            }
        };

        reader.readAsText(file);
    });



    // ===============================
    // Sidebar
    // ===============================
    const toggleBtn = document.getElementById("toggle");
    const sidebar = document.getElementById("sidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.onclick = () => {
            sidebar.classList.toggle("open");
            setTimeout(() => carte.invalidateSize(), 320);
        };
    } else {
        console.warn("Sidebar ou bouton introuvable");
    }

});


