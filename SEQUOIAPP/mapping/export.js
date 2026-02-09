// Fonction de téléchargemt des données en fonction de l'extention choisi : 

export async function downloadData(format, loadedLayers) {

    const collection = {
        type: "FeatureCollection",
        features: []
    };

    loadedLayers.forEach(layer => {
        const gj = layer.toGeoJSON();
        if (gj.type === "FeatureCollection") {
            collection.features.push(...gj.features);
        } else {
            collection.features.push(gj);
        }
    });

    const  projectName = 
        document.querySelector("#project_name p")?.textContent?.trim()|| "export";

    const zip = new JSZip();

    if (format === "geojson") {
        zip.file(`${projectName}.geojson`, JSON.stringify(collection, null, 2));
    }

    if (format === "csv") {
        let rows = [];
        let headers = new Set();

        collection.features.forEach(f => {
            Object.keys(f.properties || {}).forEach(k => headers.add(k));
        });

        headers = Array.from(headers);
        rows.push(headers.join(";"));

        collection.features.forEach(f => {
            const line = headers.map(h => f.properties[h] ?? "").join(";");
            rows.push(line);
        });

        zip.file("data.csv", rows.join("\n"));
    }

    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${projectName}_${format}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
}