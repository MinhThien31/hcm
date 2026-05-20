import { config } from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createChatResponse, getChatErrorResponse } from "./server/openai-chat.mjs";

config({ path: ".env.local" });
config();

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);
const distDir = resolve("dist");

app.use(express.json({ limit: "1mb" }));

app.post("/api/chat", async (req, res) => {
  try {
    const result = await createChatResponse(req.body, process.env);
    res.json(result);
  } catch (error) {
    const { statusCode, body } = getChatErrorResponse(error);
    console.error("[api/chat]", error);
    res.status(statusCode).json(body);
  }
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(resolve(distDir, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${port}`);
});
