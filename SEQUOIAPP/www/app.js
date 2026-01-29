
console.log("JS chargé !");

// app.js — sait parler à Plumber
window.runFunction = async function(fname, args){
  try {
    const res = await fetch("http://127.0.0.1:8000/run_function", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ function: fname, args: args })
    });
    const data = await res.json();
    return data;  // {result:..., error:...}
  } catch(err){
    return {result: null, error: err.message};
  }
};


