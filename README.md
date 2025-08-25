# 🏆 SukunaTOP

Un bot WhatsApp multipiattaforma basato su **Baileys**.  
Permette di monitorare i messaggi e generare classifiche **utenti** e **gruppi** con grafiche personalizzate 🎨.

---

## 🚀 Funzionalità
- 📊 Classifica **Top Utenti** con canvas (4:5 verticale, immagini profilo, medaglie, bottoni).
- 👥 Classifica **Top Gruppi** con messaggi e numero membri.
- 🔒 Gestione sessioni persistenti.
- ⚡ Database JSON semplice (`usersdb.json`, `gpdb.json`).
- 🖼 Generazione di immagini con **node-canvas**.

---

## 📦 Installazione

Clona la repo:

```bash
git clone https://github.com/kekk00/SukunaTOP
cd SukunaTOP
Installa le dipendenze:

bash
Copia
Modifica
npm install
# oppure
yarn install
▶️ Avvio
Per avviare il bot:

bash
Copia
Modifica
node main.js
Alla prima esecuzione ti verrà richiesto un QR code da scansionare con WhatsApp.

📁 Struttura progetto
bash
Copia
Modifica
SukunaTOP/
│
├── plugins/          # Comandi (es. topusers, topgruppi)
├── sessions/         # Sessioni WhatsApp (restano salvate)
├── handler.js        # Gestore dei messaggi e database
├── main.js           # Entrypoint del bot
├── package.json
├── README.md
└── .gitignore
🛠 Tecnologie
Baileys – WhatsApp Web API

node-canvas – Generazione immagini

Node.js 20+

📜 Licenza
Distribuito sotto licenza MIT.
Vedi LICENSE per maggiori informazioni.
