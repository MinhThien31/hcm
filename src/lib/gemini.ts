import chapter01Full from "../../knowledge-full/hcm-chapter-01.md?raw";
import chapter02Full from "../../knowledge-full/hcm-chapter-02.md?raw";
import chapter03Full from "../../knowledge-full/hcm-chapter-03.md?raw";
import chapter04Full from "../../knowledge-full/hcm-chapter-04.md?raw";
import chapter05Full from "../../knowledge-full/hcm-chapter-05.md?raw";
import chapter06Full from "../../knowledge-full/hcm-chapter-06.md?raw";
import chapter0501Notes from "../../knowledge/hcm-chapter-05-1.md?raw";
import chapter0502Notes from "../../knowledge/hcm-chapter-05-2.md?raw";
import { chapter5Knowledge } from "./chapter5Knowledge";

type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

type KnowledgeDocument = {
  id: string;
  title: string;
  source: string;
  priority: number;
  text: string;
};

type KnowledgeChunk = {
  id: string;
  title: string;
  source: string;
  priority: number;
  text: string;
  normalizedText: string;
};

type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MODEL = import.meta.env.VITE_LLM_MODEL || "gpt-5.5";
const API_KEY = import.meta.env.VITE_LLM_API_KEY;
const API_BASE_URL = (import.meta.env.VITE_LLM_BASE_URL || "/api-freemodel/v1").replace(/\/$/, "");
const configuredMaxResults = Number.parseInt(import.meta.env.VITE_FILE_SEARCH_MAX_RESULTS || "8", 10);
const MAX_RESULTS = Math.min(Number.isFinite(configuredMaxResults) ? configuredMaxResults : 4, 4);
const CHUNK_TARGET_SIZE = 1_800;
const CHUNK_OVERLAP_SIZE = 220;
const MAX_CONTEXT_CHARS = 6_500;
const MAX_CHUNK_CHARS = 1_500;
const API_TIMEOUT_MS = 6_500;

const QUICK_TOPIC_ANSWERS = [
  {
    phrases: ["dai doan ket toan dan toc"],
    answer:
      "Đại đoàn kết toàn dân tộc là tư tưởng chiến lược của Hồ Chí Minh về việc tập hợp, đoàn kết mọi người Việt Nam yêu nước, không phân biệt giai cấp, dân tộc, tôn giáo, đảng phái, nhằm tạo thành sức mạnh chung cho cách mạng.\n\nTrong Chương 5, nội dung này còn được nhấn mạnh là mục tiêu, nhiệm vụ hàng đầu của cách mạng và là nhân tố quyết định thắng lợi.\n\nNguồn: Ghi chú Chương 5 và giáo trình Chương 5.",
  },
  {
    phrases: ["muc tieu", "nhiem vu", "dai doan ket"],
    answer:
      "Theo tư tưởng Hồ Chí Minh, đại đoàn kết toàn dân tộc không chỉ là khẩu hiệu mà là mục tiêu, nhiệm vụ hàng đầu của cách mạng. Cách mạng muốn thắng lợi phải quy tụ được sức mạnh của toàn dân, biến tinh thần yêu nước và lợi ích chung của dân tộc thành hành động thống nhất.\n\nNguồn: Ghi chú Chương 5.",
  },
  {
    phrases: ["nen tang", "dai doan ket"],
    answer:
      "Nền tảng của khối đại đoàn kết toàn dân tộc là liên minh công nhân - nông dân - trí thức, đặt dưới sự lãnh đạo của Đảng. Từ nền tảng đó, Mặt trận mở rộng đoàn kết với mọi tầng lớp, cá nhân yêu nước vì lợi ích chung của dân tộc.\n\nNguồn: Chương 5.",
  },
  {
    phrases: ["mat tran", "dan toc thong nhat"],
    answer:
      "Hình thức tổ chức của khối đại đoàn kết toàn dân tộc là Mặt trận dân tộc thống nhất. Mặt trận là nơi quy tụ các giai cấp, tầng lớp, dân tộc, tôn giáo, đảng phái và cá nhân yêu nước trên cơ sở lợi ích chung của dân tộc.\n\nNguồn: Chương 5.",
  },
  {
    phrases: ["doan ket quoc te"],
    answer:
      "Đoàn kết quốc tế trong tư tưởng Hồ Chí Minh là sự kết hợp sức mạnh dân tộc với sức mạnh thời đại, tranh thủ sự ủng hộ của phong trào cách mạng, phong trào giải phóng dân tộc và các lực lượng hòa bình, dân chủ, tiến bộ trên thế giới.\n\nNguồn: Chương 5.",
  },
  {
    phrases: ["doc lap dan toc", "chu nghia xa hoi"],
    answer:
      "Trong tư tưởng Hồ Chí Minh, độc lập dân tộc gắn liền với chủ nghĩa xã hội. Độc lập là điều kiện trước hết để nhân dân làm chủ vận mệnh, còn chủ nghĩa xã hội là con đường bảo đảm độc lập ấy bền vững, đem lại tự do, hạnh phúc cho nhân dân.\n\nNguồn: Chương 3.",
  },
];

const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "chapter-05-notes-1",
    title: "Ghi chú Chương 5 - phần 1",
    source: "knowledge/hcm-chapter-05-1.md",
    priority: 5,
    text: chapter0501Notes,
  },
  {
    id: "chapter-05-notes-2",
    title: "Ghi chú Chương 5 - phần 2",
    source: "knowledge/hcm-chapter-05-2.md",
    priority: 5,
    text: chapter0502Notes,
  },
  {
    id: "chapter-01-full",
    title: "Chương 1 - Khái niệm, đối tượng, phương pháp nghiên cứu và ý nghĩa học tập",
    source: "knowledge-full/hcm-chapter-01.md",
    priority: 2,
    text: chapter01Full,
  },
  {
    id: "chapter-02-full",
    title: "Chương 2 - Cơ sở, quá trình hình thành và phát triển tư tưởng Hồ Chí Minh",
    source: "knowledge-full/hcm-chapter-02.md",
    priority: 2,
    text: chapter02Full,
  },
  {
    id: "chapter-03-full",
    title: "Chương 3 - Tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội",
    source: "knowledge-full/hcm-chapter-03.md",
    priority: 2,
    text: chapter03Full,
  },
  {
    id: "chapter-04-full",
    title: "Chương 4 - Tư tưởng Hồ Chí Minh về Đảng Cộng sản Việt Nam và Nhà nước",
    source: "knowledge-full/hcm-chapter-04.md",
    priority: 2,
    text: chapter04Full,
  },
  {
    id: "chapter-05-full",
    title: "Chương 5 - Tư tưởng Hồ Chí Minh về đại đoàn kết và đoàn kết quốc tế",
    source: "knowledge-full/hcm-chapter-05.md",
    priority: 3,
    text: chapter05Full,
  },
  {
    id: "chapter-06-full",
    title: "Chương 6 - Tư tưởng Hồ Chí Minh về văn hóa, đạo đức, con người",
    source: "knowledge-full/hcm-chapter-06.md",
    priority: 2,
    text: chapter06Full,
  },
];

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

function stripFrontMatter(value: string): string {
  return value.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function splitIntoChunks(document: KnowledgeDocument): KnowledgeChunk[] {
  const cleanText = stripFrontMatter(document.text);
  const paragraphs = cleanText.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: KnowledgeChunk[] = [];
  let current = "";
  let index = 0;

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > CHUNK_TARGET_SIZE) {
      chunks.push({
        id: `${document.id}-${index}`,
        title: document.title,
        source: document.source,
        priority: document.priority,
        text: current.trim(),
        normalizedText: normalizeVietnameseText(current),
      });
      index += 1;
      current = current.slice(-CHUNK_OVERLAP_SIZE);
    }

    current = `${current}\n\n${paragraph}`.trim();
  }

  if (current) {
    chunks.push({
      id: `${document.id}-${index}`,
      title: document.title,
      source: document.source,
      priority: document.priority,
      text: current.trim(),
      normalizedText: normalizeVietnameseText(current),
    });
  }

  return chunks;
}

const KNOWLEDGE_CHUNKS = KNOWLEDGE_DOCUMENTS.flatMap(splitIntoChunks);

function getQueryTerms(message: string): string[] {
  const normalized = normalizeVietnameseText(message);
  const terms = normalized
    .split(/\s+/)
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));

  return Array.from(new Set(terms));
}

const STOP_WORDS = new Set([
  "anh",
  "ban",
  "cac",
  "cho",
  "cua",
  "duoc",
  "gi",
  "hay",
  "hcm",
  "minh",
  "hoi",
  "khong",
  "la",
  "mot",
  "nao",
  "neu",
  "nhu",
  "noi",
  "phan",
  "sao",
  "the",
  "thi",
  "trong",
  "tu",
  "tuong",
  "ve",
  "voi",
]);

function scoreChunk(chunk: KnowledgeChunk, terms: string[], normalizedMessage: string): number {
  let score = chunk.priority;
  const normalizedTitle = normalizeVietnameseText(chunk.title);

  for (const term of terms) {
    if (normalizedTitle.includes(term)) score += 6;
    if (chunk.normalizedText.includes(term)) score += 2;
  }

  const importantPhrases = [
    "chuong 1",
    "chuong 2",
    "chuong 3",
    "chuong 4",
    "chuong 5",
    "chuong 6",
    "dai doan ket",
    "doan ket quoc te",
    "doc lap dan toc",
    "chu nghia xa hoi",
    "dang cong san",
    "nha nuoc",
    "van hoa",
    "dao duc",
    "con nguoi",
  ];

  for (const phrase of importantPhrases) {
    if (normalizedMessage.includes(phrase) && chunk.normalizedText.includes(phrase)) {
      score += 10;
    }
  }

  return score;
}

function retrieveKnowledge(message: string): KnowledgeChunk[] {
  const terms = getQueryTerms(message);
  const normalizedMessage = normalizeVietnameseText(message);

  if (terms.length === 0) {
    return KNOWLEDGE_CHUNKS
      .filter((chunk) => chunk.source.includes("hcm-chapter-05"))
      .slice(0, Math.max(2, MAX_RESULTS));
  }

  return KNOWLEDGE_CHUNKS
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, terms, normalizedMessage),
    }))
    .filter((item) => item.score > item.chunk.priority)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(2, MAX_RESULTS))
    .map((item) => item.chunk);
}

function formatKnowledgeContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "Không tìm thấy đoạn tài liệu phù hợp trong dữ liệu đã nạp.";

  let usedChars = 0;
  const selectedTexts: string[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const remainingChars = MAX_CONTEXT_CHARS - usedChars;
    if (remainingChars <= 0) break;

    const text = chunk.text
      .replace(/\n{3,}/g, "\n\n")
      .slice(0, Math.min(MAX_CHUNK_CHARS, remainingChars))
      .trim();
    const formatted = `[Nguồn ${index + 1}: ${chunk.title} | ${chunk.source}]\n${text}`;
    selectedTexts.push(formatted);
    usedChars += formatted.length;
  }

  return selectedTexts.join("\n\n---\n\n");
}

function getGreetingResponse(message: string): string | null {
  const normalized = normalizeVietnameseText(message);

  if (/^(hi|hello|hey|xin chao|chao|alo|test|ping)$/.test(normalized)) {
    return "Chào bạn! Mình là trợ lý học tập môn Tư tưởng Hồ Chí Minh. Mình đã được nạp cả ghi chú Chương 5 và bản giáo trình đầy đủ Chương 1 đến Chương 6, nên bạn có thể hỏi theo từng chương hoặc hỏi tổng hợp.";
  }

  return null;
}

function getQuickTopicResponse(message: string): string | null {
  const normalized = normalizeVietnameseText(message);
  const needsDetailedAnswer = [
    "phan tich",
    "so sanh",
    "lien he",
    "thuyet trinh",
    "chi tiet",
    "vi sao",
    "chung minh",
  ].some((phrase) => normalized.includes(phrase));

  if (needsDetailedAnswer) return null;

  const topic = QUICK_TOPIC_ANSWERS.find((item) =>
    item.phrases.every((phrase) => normalized.includes(phrase)),
  );

  return topic?.answer || null;
}

function formatHistory(history: ChatHistoryItem[]): ChatCompletionMessage[] {
  return history
    .slice(-4)
    .map((item): ChatCompletionMessage => ({
      role: item.role === "model" ? "assistant" : "user",
      content: item.parts.map((part) => part.text).join("\n"),
    }));
}

function buildSystemPrompt(): string {
  return [
    "Bạn là trợ lý học tập môn Tư tưởng Hồ Chí Minh.",
    "Luôn trả lời bằng tiếng Việt, ngắn gọn, rõ ý, đúng trọng tâm.",
    "Ưu tiên dựa trên các đoạn tài liệu được cung cấp trong phần DỮ LIỆU ĐÃ TRUY XUẤT.",
    "Nếu tài liệu truy xuất chưa đủ để kết luận chắc chắn, hãy nói rõ phần đó chưa thấy trong dữ liệu hiện có rồi mới bổ sung bằng kiến thức chung nếu cần.",
    "Khi phù hợp, ghi nguồn ngắn ở cuối theo dạng: Nguồn: Chương ..., hoặc tên ghi chú.",
  ].join("\n");
}

function buildUserPrompt(message: string, chunks: KnowledgeChunk[]): string {
  return [
    "DỮ LIỆU ĐÃ TRUY XUẤT:",
    formatKnowledgeContext(chunks),
    "",
    "CÂU HỎI CỦA NGƯỜI DÙNG:",
    message,
  ].join("\n");
}

function formatMessagesForResponses(messages: ChatCompletionMessage[]): {
  instructions: string;
  input: string;
} {
  const instructions =
    messages.find((message) => message.role === "system")?.content || buildSystemPrompt();
  const input = messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      const label = message.role === "assistant" ? "Trợ lý" : "Người dùng";
      return `${label}:\n${message.content}`;
    })
    .join("\n\n");

  return { instructions, input };
}

function extractResponseText(data: any): string {
  if (typeof data?.output_text === "string") return data.output_text.trim();

  const content = data?.output
    ?.flatMap((item: any) => item?.content || [])
    ?.map((contentItem: any) => contentItem?.text || "")
    ?.filter(Boolean)
    ?.join("\n");

  return content?.trim() || "";
}

async function requestChatCompletion(messages: ChatCompletionMessage[]): Promise<string> {
  if (!API_KEY) {
    throw new Error("Missing VITE_LLM_API_KEY");
  }

  const { instructions, input } = formatMessagesForResponses(messages);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      max_output_tokens: 450,
      reasoning: {
        effort: "low",
      },
      text: {
        format: { type: "text" },
        verbosity: "low",
      },
    }),
  }).finally(() => window.clearTimeout(timeoutId));

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || `LLM request failed with status ${response.status}`);
  }

  return extractResponseText(data);
}

function buildLocalFallback(message: string, chunks: KnowledgeChunk[]): string {
  const context = chunks.slice(0, 3);

  if (context.length === 0) {
    return [
      "Mình chưa tìm được đoạn thật sát với câu hỏi trong dữ liệu đã nạp.",
      "",
      "Bạn có thể hỏi rõ hơn theo chương hoặc theo khái niệm, ví dụ: đại đoàn kết toàn dân tộc, độc lập dân tộc, chủ nghĩa xã hội, Đảng Cộng sản Việt Nam, văn hóa, đạo đức, con người.",
    ].join("\n");
  }

  return [
    "Mình đã tìm được các đoạn liên quan trong dữ liệu full, nhưng hiện chưa gọi được model nên mình trả về phần trích dữ liệu gần nhất:",
    "",
    ...context.map((chunk, index) => {
      const preview = chunk.text.replace(/\s+/g, " ").slice(0, 850).trim();
      return `Nguồn ${index + 1}: ${chunk.title}\n${preview}${chunk.text.length > 850 ? "..." : ""}`;
    }),
  ].join("\n\n");
}

export const getChatResponse = async (
  message: string,
  history: ChatHistoryItem[],
): Promise<string> => {
  const greeting = getGreetingResponse(message);
  if (greeting) return greeting;

  const quickAnswer = getQuickTopicResponse(message);
  if (quickAnswer) return quickAnswer;

  const chunks = retrieveKnowledge(message);
  const messages: ChatCompletionMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...formatHistory(history).slice(0, -1),
    { role: "user", content: buildUserPrompt(message, chunks) },
  ];

  try {
    const answer = await requestChatCompletion(messages);
    return answer || buildLocalFallback(message, chunks);
  } catch (error) {
    console.error(error);
    return buildLocalFallback(message, chunks);
  }
};

export const generateImage = async (
  _prompt: string,
): Promise<string | null> => {
  return null;
};

export const localKnowledgePreview = [
  chapter5Knowledge,
  `Đã nạp thêm bộ giáo trình full gồm ${KNOWLEDGE_DOCUMENTS.length} tài liệu và ${KNOWLEDGE_CHUNKS.length} đoạn truy xuất.`,
].join("\n\n");
