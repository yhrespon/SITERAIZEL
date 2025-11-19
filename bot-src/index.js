// =======================
// IMPORTS
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode
} from "@whiskeysockets/baileys";

import chalk from "chalk";
import fs from "fs";
import path from "path";
import pino from "pino";
import readline from "readline";
import { execSync } from "child_process";

import { initProtections } from "./protections.js";
import { initSecurity } from "./security.js";
import { welcomeEvents } from "./commands/welcome.js";
import { autoreactEvents } from "./commands/autoreact.js";
import { autoreadEvents } from "./commands/autoread.js";
import { autotypingEvents } from "./commands/autotyping.js";
import { autoreadstatusEvents } from "./commands/autoreadstatus.js";
import { autobioEvents } from "./commands/autobio.js";
import { autobvnEvents } from "./commands/autobvn.js";
import { autorecordingEvents } from "./commands/autorecording.js";
import statusLike from "./events/statuslike.js";
import kickstickerCommands from "./commands/kicksticker.js";
import { antideleteEvents } from "./commands/antidelete.js";
import securityCommands from "./commands/security.js";
import protectionCommands from "./commands/protectionCommands.js";
import { bugall } from "./bugall.js";
import delayCommands from "./delay.js";
import bugssCommands from "./bugss.js";

// =======================
// IMPORT BUGS
import * as Bugs from "./bugs.js";

// =======================
// EXPORT UTILITAIRES
export { getBareNumber, getMode, setMode, getUserConfig, setUserConfig, loadSudo, normalizeJid, unwrapMessage, pickText };

// =======================
// AUTO-INSTALL GTTS
let gTTS;
try {
  gTTS = (await import("gtts")).default;
} catch (e) {
  console.log("📦 gtts non trouvé, installation en cours...");
  try {
    execSync("npm install gtts", { stdio: "inherit" });
    gTTS = (await import("gtts")).default;
    console.log("✅ gtts installé avec succès !");
  } catch (err) {
    console.error("❌ Impossible d’installer gtts automatiquement :", err);
    process.exit(1);
  }
}

// =======================
// GLOBAL CONFIG
global.botPrefix = process.env.PREFIX || ".";
global.cleanPrefixEnabled = false;

const STATUS_REACT = "💚";
const MODE_FILE = "./mode.json";
const CONFIG_PATH = "./config.json";
const SUDO_FILE = "./sudo.json";

// =======================
// HELPERS
function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

function unwrapMessage(m) {
  return m?.ephemeralMessage?.message ||
         m?.viewOnceMessageV2?.message ||
         m?.viewOnceMessageV2Extension?.message ||
         m?.documentWithCaptionMessage?.message ||
         m?.viewOnceMessage?.message ||
         m;
}

function pickText(m) {
  return m?.conversation ||
         m?.extendedTextMessage?.text ||
         m?.imageMessage?.caption ||
         m?.videoMessage?.caption ||
         m?.buttonsResponseMessage?.selectedButtonId ||
         m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
         m?.templateButtonReplyMessage?.selectedId ||
         m?.reactionMessage?.text ||
         m?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
}

function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace("@lid", "@s.whatsapp.net");
}

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, JSON.stringify({ users: {} }, null, 2));
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(cfg) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); }
function getUserConfig(number) { return getConfig().users[number] || null; }
function setUserConfig(number, data) {
  const cfg = getConfig();
  cfg.users[number] = { ...(cfg.users[number] || {}), ...data };
  saveConfig(cfg);
}

function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
}

function getMode() {
  if (!fs.existsSync(MODE_FILE)) {
    fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "private" }, null, 2));
    return "private";
  }
  const data = JSON.parse(fs.readFileSync(MODE_FILE, "utf-8"));
  return data.mode || "private";
}

function setMode(newMode) {
  fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: newMode }, null, 2));
}

function question(query) {
  process.stdout.write(query + "\n> ");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.on("line", input => { rl.close(); resolve(input); });
  });
}

function afficherBanner() {
  console.log("\n🎉 DEV-RAIZEL 🎉\n");
}

// =======================
// SAFE JID DECODER
global.safeDecodeJid = function (jid) {
  if (!jid) return "";
  try {
    const decoded = jidDecode(jid);
    return decoded?.user ? `${decoded.user}@s.whatsapp.net` : jid;
  } catch {
    return jid.split("@")[0] + "@s.whatsapp.net";
  }
};

// =======================
// PATCH SOCKET
function patchSocket(sock) {
  const originalDecode = sock.decodeJid;
  sock.decodeJid = (jid) => {
    if (!jid) return "";
    try {
      const decoded = originalDecode ? originalDecode(jid) : jidDecode(jid);
      return decoded?.user ? `${decoded.user}@s.whatsapp.net` : jid;
    } catch {
      return jid;
    }
  };
  return sock;
}

// =======================
// REMOVE LISTENERS
process.setMaxListeners(0);

// =======================
// START BOT
async function startPairing() {
  const sessionFolder = process.env.SESSION_ID ? `./session_${process.env.SESSION_ID}` : "./session";

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  let sock = makeWASocket({
    version,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  sock = patchSocket(sock);
  global.surz = sock;

  // PAIRING
  if (!state.creds.registered) {
    console.log(chalk.cyan("\n=== 🔗 CONFIGURATION DE L’APPAREIL ===\n"));

    const envTarget = process.env.TARGET_NUMBER ? String(process.env.TARGET_NUMBER).trim() : null;

    const phoneNumber = envTarget || (await question(chalk.cyan.bold("📱 Entre ton numéro WhatsApp (ex: 2376XXXXXXXX): ")));

    const targetNumber = phoneNumber.trim();

    const pairingCode = await sock.requestPairingCode(targetNumber, "DVRAIZEL");

    if (envTarget) {
      console.log("__PAIRING_CODE__:" + pairingCode);
    } else {
      console.log("Code :", pairingCode);
    }
  }

  // CONNECTION HANDLING
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(chalk.greenBright("✅ Connecté à WhatsApp !"));
      afficherBanner();

      const ownerEnv = process.env.OWNER;
      const sudoEnv = process.env.SUDO ? process.env.SUDO.split(",") : [];

      const botId = normalizeJid(sock.user?.id);
      const bareBot = getBareNumber(botId);

      global.owners = [ownerEnv ? getBareNumber(ownerEnv) : bareBot];
      global.sudoUsers = sudoEnv;

      console.log(chalk.green(`Propriétaire : ${global.owners[0]}`));

    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode ||
        lastDisconnect?.error?.message ||
        "Inconnue";

      console.log(chalk.red("❌ Déconnecté :", reason));
      console.log("🔄 Redémarrage dans 3 secondes...");

      setTimeout(() => startPairing(), 3000);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // INIT MODULES
  initProtections(sock);
  initSecurity(sock);
  welcomeEvents(sock);
  autoreactEvents(sock);
  autorecordingEvents(sock);
  autoreadEvents(sock);
  autotypingEvents(sock);
  autoreadstatusEvents(sock);
  autobioEvents(sock);
  autobvnEvents(sock);
  antideleteEvents(sock);

  // LOAD COMMANDS
  const commands = {};
  const commandFiles = fs.readdirSync(path.join("./commands")).filter(f => f.endsWith(".js") || f.endsWith(".mjs"));
  
  for (const file of commandFiles) {
    const moduleCmd = await import(path.resolve(`./commands/${file}`));
    const cmds = moduleCmd.default || moduleCmd;
    if (Array.isArray(cmds)) cmds.forEach(c => commands[c.name] = c);
    else if (cmds.name && cmds.execute) commands[cmds.name] = cmds;
  }

  kickstickerCommands.forEach(c => commands[c.name] = c);
  protectionCommands.forEach(c => commands[c.name] = c);
  securityCommands.forEach(c => commands[c.name] = c);
  delayCommands.forEach(c => commands[c.name] = c);

  const bugCommands = [
    Bugs.frez, Bugs.Vo, Bugs.Invisidelay, Bugs.crashBlank,
    Bugs.Invisicrash, Bugs.bugmenu, Bugs.forcloseCombo, Bugs.queenCombo
  ];
  bugCommands.forEach(c => { if (c) commands[c.name] = c; });
  
  bugssCommands.forEach(c => commands[c.name] = c);

  // MESSAGE HANDLER
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text = pickText(unwrapMessage(msg.message));

    if (!text) return;

    const prefix = process.env.PREFIX || ".";

    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (commands[cmd]) {
      try { await commands[cmd].execute(sock, msg, args, from); } 
      catch (err) { console.error(chalk.red(`Erreur commande ${cmd} :`), err); }
    }
  });
}

// START
startPairing();