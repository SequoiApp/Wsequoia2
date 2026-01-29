// main.js — interaction utilisateur
document.getElementById("btnCount").addEventListener("click", async () => {
  const fileInput = document.getElementById("shpFile");
  if(fileInput.files.length === 0){
    alert("Choisis un shapefile !");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  // Appel API via runFunction
  
  const data = await runFunction("count_features", { shp_path: file.name }); // ou uploader via FormData selon Plumber
  if(data.error){
    document.getElementById("result").textContent = "Erreur : " + data.error;
  } else {
    document.getElementById("result").textContent = "Nombre d'entités : " + data.result.n_features;
  }
});

