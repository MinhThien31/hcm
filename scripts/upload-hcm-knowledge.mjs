import { Blob } from "node:buffer";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_LLM_API_KEY;
const apiBase = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeDir = resolve(process.env.HCM_KNOWLEDGE_DIR || join(projectRoot, "knowledge"));

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Set it before running this script.");
  process.exit(1);
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const localEnv = readEnvFile(join(projectRoot, ".env.local"));

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function createVectorStore(name, description) {
  return request("/vector_stores", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

async function uploadFile(filePath) {
  const form = new FormData();
  form.set("purpose", "assistants");
  form.set("file", new Blob([readFileSync(filePath)]), basename(filePath));

  return request("/files", {
    method: "POST",
    body: form,
  });
}

async function attachFile(vectorStoreId, fileId, attributes) {
  return request(`/vector_stores/${vectorStoreId}/files`, {
    method: "POST",
    body: JSON.stringify({ file_id: fileId, attributes }),
  });
}

async function getVectorStoreFile(vectorStoreId, fileId) {
  return request(`/vector_stores/${vectorStoreId}/files/${fileId}`);
}

async function waitForVectorStoreFile(vectorStoreId, fileId) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const file = await getVectorStoreFile(vectorStoreId, fileId);
    if (["completed", "failed", "cancelled"].includes(file.status)) return file;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Timed out while indexing ${fileId} in ${vectorStoreId}`);
}

function parseFrontMatter(filePath) {
  const content = readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const attributes = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.includes(":")) continue;
    const index = line.indexOf(":");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (key && value) attributes[key] = value;
  }

  return attributes;
}

function listKnowledgeFiles() {
  if (!existsSync(knowledgeDir)) {
    throw new Error(`Knowledge directory not found: ${knowledgeDir}`);
  }

  return readdirSync(knowledgeDir)
    .filter((name) => [".md", ".txt", ".pdf"].includes(extname(name).toLowerCase()))
    .filter((name) => !name.includes("placeholder"))
    .map((name) => join(knowledgeDir, name));
}

const chapter3StoreId =
  process.env.HCM_CHAPTER3_VECTOR_STORE_ID ||
  process.env.VITE_HCM_CHAPTER3_VECTOR_STORE_ID ||
  localEnv.VITE_HCM_CHAPTER3_VECTOR_STORE_ID;

const vectorStore =
  chapter3StoreId ||
  (
    await createVectorStore(
      "HCM Chapter 3 Knowledge",
      "Tu tuong Ho Chi Minh chapter 3, Session 10-12, and OCR textbook excerpts."
    )
  ).id;

console.log(`Using vector store: ${vectorStore}`);

const files = listKnowledgeFiles();
if (files.length === 0) {
  console.log(`No uploadable knowledge files found in ${knowledgeDir}`);
  process.exit(0);
}

for (const filePath of files) {
  const attributes = {
    subject: "hcm",
    chapter: "3",
    priority: "primary",
    ...parseFrontMatter(filePath),
  };

  console.log(`Uploading ${basename(filePath)}...`);
  const uploaded = await uploadFile(filePath);
  const attached = await attachFile(vectorStore, uploaded.id, attributes);
  const indexed = await waitForVectorStoreFile(vectorStore, attached.id);

  console.log(`Indexed ${basename(filePath)} as ${indexed.id} (${indexed.status})`);
}

console.log("");
console.log("Done. Put this in .env.local:");
console.log(`VITE_HCM_CHAPTER3_VECTOR_STORE_ID=${vectorStore}`);
