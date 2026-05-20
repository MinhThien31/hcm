type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

const API_TIMEOUT_MS = 30_000;

function normalizeVietnameseText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getGreetingResponse(message: string): string | null {
  const normalized = normalizeVietnameseText(message);

  if (/^(hi|hello|hey|xin chao|chao|alo|test|ping)$/.test(normalized)) {
    return "Chào bạn! Mình là trợ lý học tập môn Tư tưởng Hồ Chí Minh. Mình đang dùng OpenAI Vector Store để tìm tài liệu trước khi trả lời.";
  }

  return null;
}

export const getChatResponse = async (
  message: string,
  history: ChatHistoryItem[],
): Promise<string> => {
  const greeting = getGreetingResponse(message);
  if (greeting) return greeting;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch("/api/chat", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history }),
  }).finally(() => window.clearTimeout(timeoutId));

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Chat request failed with status ${response.status}`);
  }

  return data?.answer?.trim() || "Xin lỗi, tôi chưa nhận được câu trả lời từ hệ thống.";
};

export const generateImage = async (
  _prompt: string,
): Promise<string | null> => {
  return null;
};

export const localKnowledgePreview =
  "Chatbot đang dùng OpenAI Vector Store/File Search thay cho markdown RAG cục bộ.";
