// server.js
import express from "express";
import { fork } from "child_process";

const app = express();
const numero = "+39 329 757 0233"; // 🔹 cambia con il tuo numero

// Testo mostrato in browser
app.get("/", (req, res) => {
  res.send(`<h1>Bot online</h1><p>Contattare ${numero}</p>`);
});

// Funzione per trovare una porta libera tra 3000, 8080, 5000
async function getFreePort() {
  const ports = [3000, 8080, 5000];
  for (let port of ports) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          server.close(() => resolve(port));
        });
        server.on("error", reject);
      });
      return port;
    } catch {}
  }
  throw new Error("Nessuna porta disponibile");
}

// Avvio Express + main.js
(async () => {
  const port = await getFreePort();
  app.listen(port, () =>
    console.log(`🌍 Server avviato su http://localhost:${port}`)
  );

  function startBot() {
    const bot = fork("./main.js");

    bot.on("exit", (code) => {
      console.log(`⚠️ Bot chiuso con codice ${code}, riavvio in 3s...`);
      setTimeout(startBot, 3000);
    });
  }

  startBot();
})();

