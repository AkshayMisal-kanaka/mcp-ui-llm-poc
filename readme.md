A complete working example of MCP UI Client (React) + MCP UI Server (Node.js) with Remote DOM rendering.

This project demonstrates a full UI flow built using MCP UI v5+ where the server dynamically generates UI using Remote DOM scripts, and the client renders them in React using a custom component library.

It includes:

✨ Dynamic Remote DOM rendering

🧱 Custom React component library (Buttons, Inputs, Charts, Forms, etc.)

🧰 Script Configurator (Create, Edit, and Preview Remote DOM scripts)

🛒 Shopping demo (products → cart → checkout → payment → success → feedback → reviews chart)

📊 Action logging powered by PostgreSQL

📡 Full client ↔ server tool-call flow


cd client
npm install
npm run dev

cd server
npm install
npm run dev

| URL                                                                          | Purpose                            |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| **[http://localhost:5173/](http://localhost:5173/)**                         | Main UI resource renderer          |
| **[http://localhost:5173/configurator](http://localhost:5173/configurator)** | Remote DOM Script Editor + Preview |
| **[http://localhost:5173/actions](http://localhost:5173/actions)**           | UI Action logs (from database)     |



🗄️ PostgreSQL Setup

This project stores:

✔ Remote DOM scripts

✔ UI actions

✔ Payment/feedback logs

CREATE DATABASE mcp;

server/db/db.ts

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mcp_ui_demo',
  password: 'yourpassword',
  port: 5432,
});

🎨 Features
⭐ 1. Remote DOM Rendering

Server sends JS-based Remote DOM scripts:

const button = document.createElement('ui-button');
button.setAttribute('label', 'Buy');


Client renders them dynamically using a React custom library.

⭐ 2. Custom React Component Library

Located in client/src/radix.tsx

Includes:

ui-button

ui-text

ui-text-small

ui-number-input (with decimals, formatting, card-grouping)

ui-checkbox

ui-image

ui-chart

ui-feedback-form

ui-checklist-form

ui-form-message

⭐ 3. Script Configurator

Located at:

👉 http://localhost:5173/configurator

You can:

Load saved Remote DOM scripts

Edit them live

Preview the UI

Save updated scripts to PostgreSQL

⭐ 4. Full E-Commerce Demo Flow

Product preview

Add to Cart → parent renderer updates

Cart UI displayed in the shell

Checkout → payment form

Payment success screen

Feedback form

Reviews shown as charts

Each screen = separate Remote DOM script.

⭐ 5. UI Action Logging

All user interactions triggered via tool calls are stored in PostgreSQL and viewed at:

👉 http://localhost:5173/actions

🔌 Client ↔ Server Flow
[UI Renderer]  <--renders--  UI Resource (Remote DOM)
     |
     +-- tool call --> [Server]
                         |
                         +-- returns next UI resource


Remote DOM drives the entire UI from server-side logic.

🧪 Development Workflow
Modify Component Library

Edit:

client/src/radix.tsx


Restart client if needed.

Modify Remote DOM Scripts

Use the Configurator UI or update DB manually.


🔧 Environment Variables (Optional)

Create .env in server:

DATABASE_URL=postgres://postgres:password@localhost:5432/mcp_ui_demo
PORT=8081

