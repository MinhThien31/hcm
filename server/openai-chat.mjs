import OpenAI from "openai";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MODEL = "gpt-5.5";
const DEFAULT_MAX_RESULTS = 6;
const DEFAULT_LOCAL_RAG_DIRS = ["knowledge-full", "knowledge"];
const DEFAULT_LOCAL_RAG_MAX_CHUNKS = 4;
const LOCAL_RAG_CHUNK_SIZE = 1800;
const LOCAL_RAG_CHUNK_OVERLAP = 250;
const repoRoot = path.resolve(process.cwd());

let localKnowledgeCache = null;

export class ChatServiceError extends Error {
  constructor(message, statusCode = 500, cause) {
    super(message);
    this.name = "ChatServiceError";
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getVectorStoreIds(env) {
  const explicit = parseList(env.OPENAI_VECTOR_STORE_IDS || env.OPENAI_VECTOR_STORE_ID);
  if (explicit.length > 0) return explicit;

  return [
    env.VITE_HCM_CHAPTER5_VECTOR_STORE_ID,
    env.VITE_HCM_TEXTBOOK_VECTOR_STORE_ID,
    env.VITE_VECTOR_STORE_ID,
  ].filter(Boolean);
}

function getApiKey(env) {
  return env.OPENAI_API_KEY || env.VITE_LLM_API_KEY;
}

function getBaseURL(env) {
  return env.OPENAI_BASE_URL || env.VITE_LLM_BASE_URL || undefined;
}

function getModel(env) {
  return env.OPENAI_MODEL || env.VITE_LLM_MODEL || DEFAULT_MODEL;
}

function getMaxResults(env) {
  const configured = Number.parseInt(
    env.OPENAI_FILE_SEARCH_MAX_RESULTS || env.VITE_FILE_SEARCH_MAX_RESULTS || "",
    10,
  );

  if (!Number.isFinite(configured)) return DEFAULT_MAX_RESULTS;
  return Math.max(1, Math.min(configured, 20));
}

function getLocalRagDirs(env) {
  const configured = parseList(env.OPENAI_LOCAL_RAG_DIRS || env.VITE_LOCAL_RAG_DIRS);
  return configured.length > 0 ? configured : DEFAULT_LOCAL_RAG_DIRS;
}

function getLocalRagMaxChunks(env) {
  const configured = Number.parseInt(env.OPENAI_LOCAL_RAG_MAX_CHUNKS || "", 10);

  if (!Number.isFinite(configured)) return DEFAULT_LOCAL_RAG_MAX_CHUNKS;
  return Math.max(1, Math.min(configured, 8));
}

function isInsideRoot(childPath, rootPath) {
  const relative = path.relative(rootPath, childPath);
  return relative === "" || (relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveLocalRagRoot(env, dirs) {
  const candidates = [
    env.OPENAI_LOCAL_RAG_ROOT && path.resolve(env.OPENAI_LOCAL_RAG_ROOT),
    repoRoot,
    env.LAMBDA_TASK_ROOT && path.resolve(env.LAMBDA_TASK_ROOT),
    path.resolve(process.cwd()),
  ].filter(Boolean);

  return candidates.find((candidate) => (
    dirs.some((dir) => existsSync(path.resolve(candidate, dir)))
  )) || repoRoot;
}

function isOfficialOpenAIBaseURL(baseURL) {
  if (!baseURL) return true;

  try {
    return new URL(baseURL).hostname === "api.openai.com";
  } catch {
    return false;
  }
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQueryTerms(message) {
  const stopWords = new Set([
    "cua", "cho", "voi", "mot", "cac", "nhung", "the", "nao", "hay", "la",
    "ve", "trong", "ngoai", "neu", "giai", "thich", "trinh", "bay", "phan",
    "tich", "tu", "tuong", "ho", "chi", "minh",
  ]);

  return Array.from(new Set(normalizeSearchText(message).split(/\s+/)))
    .filter((term) => term.length >= 3 && !stopWords.has(term));
}

function chunkText(text, source) {
  const cleaned = compactText(text);
  const chunks = [];

  for (let start = 0; start < cleaned.length; start += LOCAL_RAG_CHUNK_SIZE - LOCAL_RAG_CHUNK_OVERLAP) {
    const content = cleaned.slice(start, start + LOCAL_RAG_CHUNK_SIZE).trim();
    if (content.length >= 120) {
      chunks.push({
        source,
        text: content,
        searchText: normalizeSearchText(content),
      });
    }
  }

  return chunks;
}

async function loadLocalKnowledge(env) {
  const dirs = getLocalRagDirs(env);
  const ragRoot = resolveLocalRagRoot(env, dirs);
  const cacheKey = `${ragRoot}|${dirs.join("|")}`;

  if (localKnowledgeCache?.key === cacheKey) return localKnowledgeCache.chunks;

  const chunks = [];
  for (const dir of dirs) {
    const absoluteDir = path.resolve(ragRoot, dir);
    if (!isInsideRoot(absoluteDir, ragRoot)) continue;

    let entries;
    try {
      entries = await readdir(absoluteDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

      const absoluteFile = path.join(absoluteDir, entry.name);
      const relativeFile = path.relative(ragRoot, absoluteFile).replace(/\\/g, "/");
      const text = await readFile(absoluteFile, "utf8");
      chunks.push(...chunkText(text, relativeFile));
    }
  }

  localKnowledgeCache = { key: cacheKey, chunks };
  return chunks;
}

function scoreChunk(chunk, terms, normalizedMessage) {
  if (terms.length === 0) return 0;

  let score = 0;
  for (const term of terms) {
    const matches = chunk.searchText.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"));
    if (matches) score += matches.length;
  }

  if (normalizedMessage && chunk.searchText.includes(normalizedMessage)) {
    score += terms.length * 3;
  }

  return score;
}

async function retrieveLocalContext(message, env) {
  const chunks = await loadLocalKnowledge(env);
  const terms = getQueryTerms(message);
  const normalizedMessage = normalizeSearchText(message);
  const maxChunks = getLocalRagMaxChunks(env);

  const matches = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, terms, normalizedMessage),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);

  return {
    snippets: matches.map((match, index) => ({
      index: index + 1,
      source: match.source,
      text: match.text,
    })),
    citations: Array.from(new Set(matches.map((match) => match.source))),
  };
}

function buildLocalContextBlock(snippets) {
  if (snippets.length === 0) {
    return "LOCAL_CONTEXT: Khong tim thay doan tai lieu cuc bo phu hop voi cau hoi.";
  }

  return [
    "LOCAL_CONTEXT:",
    ...snippets.map((snippet) => [
      `[${snippet.index}] Source: ${snippet.source}`,
      snippet.text,
    ].join("\n")),
  ].join("\n\n");
}

function shouldUseFileSearch(env) {
  const configured = String(env.OPENAI_USE_FILE_SEARCH || "").trim().toLowerCase();

  if (["1", "true", "yes"].includes(configured)) return true;
  if (["0", "false", "no"].includes(configured)) return false;

  return isOfficialOpenAIBaseURL(getBaseURL(env));
}

function formatHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-6)
    .map((item) => {
      const role = item?.role === "model" ? "assistant" : "user";
      const content = Array.isArray(item?.parts)
        ? item.parts.map((part) => compactText(part?.text)).filter(Boolean).join("\n")
        : "";

      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

function buildInstructions() {
  return [
    "Bạn là trợ lý học tập môn Tư tưởng Hồ Chí Minh.",
    "Luôn trả lời bằng tiếng Việt, ngắn gọn, rõ ý, đúng trọng tâm.",
    "Bắt buộc ưu tiên tra cứu OpenAI file_search trên vector store trước khi trả lời các câu hỏi nội dung môn học.",
    "Nếu không tìm thấy dữ liệu đủ chắc trong vector store, hãy nói rõ dữ liệu hiện có chưa đủ rồi mới bổ sung bằng kiến thức chung nếu cần.",
    "Khi phù hợp, ghi nguồn ngắn ở cuối dựa trên tên file hoặc chú thích file search.",
  ].join("\n");
}

function extractText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  return (response.output || [])
    .flatMap((item) => item?.content || [])
    .map((contentItem) => contentItem?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractChatCompletionText(completion) {
  let parsedCompletion = completion;
  if (typeof completion === "string") {
    try {
      parsedCompletion = JSON.parse(completion);
    } catch {
      return completion.trim();
    }
  }

  const content = parsedCompletion?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text || "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

function extractCitations(response) {
  const filenames = new Set();

  for (const outputItem of response.output || []) {
    for (const result of outputItem?.results || []) {
      if (result?.filename) filenames.add(result.filename);
    }

    for (const contentItem of outputItem?.content || []) {
      for (const annotation of contentItem?.annotations || []) {
        if (annotation?.filename) filenames.add(annotation.filename);
      }
    }
  }

  return Array.from(filenames);
}

function toUserFacingError(error) {
  if (error?.status === 401 || error?.code === "invalid_api_key") {
    return new ChatServiceError("OpenAI API key không hợp lệ. Hãy kiểm tra lại OPENAI_API_KEY trong .env.local.", 401, error);
  }

  if (error?.status === 429 || error?.code === "insufficient_quota") {
    return new ChatServiceError("OpenAI báo tài khoản/API key đã hết quota hoặc chưa bật billing. Hãy kiểm tra plan và billing của OpenAI.", 429, error);
  }

  return new ChatServiceError(
    error?.message || "Chat request failed.",
    error?.status && Number.isInteger(error.status) ? error.status : 500,
    error,
  );
}

export function getChatErrorResponse(error) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;

  return {
    statusCode,
    body: {
      error: error instanceof Error ? error.message : "Chat request failed.",
    },
  };
}

export async function createChatResponse(payload, env = process.env) {
  const apiKey = getApiKey(env);
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. OpenAI Vector Store/File Search must run server-side.");
  }

  const vectorStoreIds = getVectorStoreIds(env);
  const useFileSearch = shouldUseFileSearch(env);
  if (useFileSearch && vectorStoreIds.length === 0) {
    throw new Error("Missing OPENAI_VECTOR_STORE_IDS or VITE_HCM_* vector store ids.");
  }

  const message = compactText(payload?.message);
  if (!message) {
    throw new ChatServiceError("Message is required.", 400);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: getBaseURL(env),
  });

  if (!useFileSearch) {
    try {
      const localContext = await retrieveLocalContext(message, env);
      const completion = await client.chat.completions.create({
        model: getModel(env),
        messages: [
          {
            role: "system",
            content: [
              buildInstructions(),
              "Dang dung local markdown RAG vi gateway hien tai khong ho tro OpenAI file_search/vector store.",
              "Hay uu tien cac doan trong LOCAL_CONTEXT de tra loi. Neu LOCAL_CONTEXT khong du, noi ro du lieu hien co chua du chac.",
              "Khong tu bia nguon. Phan Nguon se duoc he thong them sau cau tra loi.",
              buildLocalContextBlock(localContext.snippets),
            ].join("\n"),
          },
          ...formatHistory(payload?.history),
          { role: "user", content: message },
        ],
        max_tokens: 600,
      });

      return {
        answer: [
          extractChatCompletionText(completion) || "Xin lỗi, tôi chưa nhận được câu trả lời từ hệ thống.",
          localContext.citations.length > 0 ? `Nguồn: ${localContext.citations.join(", ")}` : "",
        ].filter(Boolean).join("\n\n"),
        citations: localContext.citations,
      };
    } catch (error) {
      throw toUserFacingError(error);
    }
  }

  let response;
  try {
    response = await client.responses.create({
      model: getModel(env),
      instructions: buildInstructions(),
      input: [
        ...formatHistory(payload?.history),
        { role: "user", content: message },
      ],
      tools: [{
        type: "file_search",
        vector_store_ids: vectorStoreIds,
        max_num_results: getMaxResults(env),
      }],
      include: ["file_search_call.results"],
      max_output_tokens: 600,
      text: {
        format: { type: "text" },
      },
    });
  } catch (error) {
    throw toUserFacingError(error);
  }

  const answer = extractText(response);
  const citations = extractCitations(response);

  return {
    answer: citations.length > 0
      ? `${answer}\n\nNguồn: ${citations.join(", ")}`
      : answer,
    citations,
  };
}

export async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}
