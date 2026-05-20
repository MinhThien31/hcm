import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createChatResponse, getChatErrorResponse, readJsonBody } from "./server/openai-chat.mjs";

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return {
    plugins: [
      {
        name: "openai-chat-api",
        configureServer(server) {
          server.middlewares.use("/api/chat", async (req, res, next) => {
            if (req.method !== "POST") return next();

            try {
              const payload = await readJsonBody(req);
              const result = await createChatResponse(payload, env);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(result));
            } catch (error) {
              const { statusCode, body } = getChatErrorResponse(error);
              console.error("[api/chat]", error);
              res.statusCode = statusCode;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(body));
            }
          });
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      port: 3000,
    },
  };
});
