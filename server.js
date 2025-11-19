import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const runningBots = {};

function generateSessionId() {
  return "bot_" + Math.random().toString(36).substring(2, 12);
}

app.post("/create-bot", async (req, res) => {
  try {
    const { number, owner, prefix, sudo } = req.body;

    const sessionId = generateSessionId();

    const bot = spawn("node", ["bot-src/index.js"], {
      env: {
        ...process.env,
        SESSION_ID: sessionId,
        TARGET_NUMBER: number,
        OWNER: owner,
        PREFIX: prefix,
        SUDO: sudo
      }
    });

    let pairingCode = null;

    bot.stdout.on("data", (data) => {
      const line = data.toString();

      if (line.startsWith("__PAIRING_CODE__:")) {
        pairingCode = line.replace("__PAIRING_CODE__:", "").trim();
      }
      console.log("BOT:", line);
    });

    runningBots[sessionId] = bot;

    setTimeout(() => {
      res.json({
        status: "ok",
        sessionId,
        pairingCode
      });
    }, 2000);

  } catch (err) {
    console.error(err);
    res.json({ status: "error" });
  }
});

app.get("/status/:id", (req, res) => {
  const bot = runningBots[req.params.id];
  res.json({ running: !!bot });
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Serveur démarré sur PORT", process.env.PORT);
});