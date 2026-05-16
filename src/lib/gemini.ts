import OpenAI from "openai";
import { chapter3Knowledge } from "./chapter3Knowledge";

const apiKey = import.meta.env.VITE_LLM_API_KEY;
const baseURL = import.meta.env.VITE_LLM_BASE_URL || "https://api.openai.com/v1";
const model = import.meta.env.VITE_LLM_MODEL || "gpt-4.1-mini";
const legacyVectorStoreId = import.meta.env.VITE_VECTOR_STORE_ID;
const chapter3VectorStoreId = import.meta.env.VITE_HCM_CHAPTER3_VECTOR_STORE_ID;
const textbookVectorStoreId = import.meta.env.VITE_HCM_TEXTBOOK_VECTOR_STORE_ID;
const fileSearchMaxResults = Number(import.meta.env.VITE_FILE_SEARCH_MAX_RESULTS || 6);

const ai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    })
  : null;

type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

const SYSTEM_INSTRUCTION = `Bạn là chatbot học tập cho môn Tư tưởng Hồ Chí Minh.

Phạm vi ưu tiên hiện tại:
- Chương 3: Tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội.
- Trọng tâm thuyết trình lấy theo Session 10, Session 11, Session 12.
- Nếu có vector store/file search, ưu tiên dữ liệu truy xuất từ giáo trình OCR, tài liệu Chương 3 và slide Session 10, 11, 12.
- Nếu chưa có vector store hoặc file search không tìm được căn cứ, vẫn được trả lời dựa trên dữ liệu nền từ slide, nhưng phải nói rõ khi phần nào chưa có căn cứ giáo trình.

Vai trò:
- Hãy trả lời như một trợ lý học tập đang giải thích cho sinh viên.
- Giọng văn thân thiện, rõ ý, không quá cứng, không quá hành chính.
- Không mở bài dài, không lặp ý, không dùng văn phong giáo điều.
- Không tự nhận là "trợ lý AI của Chương 5" hoặc nhắc đến nội dung Kinh tế chính trị Mác - Lênin.

HAI LUỒNG TRẢ LỜI BẮT BUỘC:

1. Nếu câu hỏi có dữ liệu trong giáo trình, slide, knowledge base hoặc kết quả vector store:
- Trả lời bình thường, tự nhiên.
- Bám sát nội dung tài liệu.
- Có thể diễn giải dễ hiểu hơn nhưng không được làm sai ý trong giáo trình/slide.
- Không cần mở đầu bằng "theo giáo trình" ở mọi câu.
- Nếu có thể xác định nguồn, hãy ghi ngắn gọn ở cuối câu trả lời, ví dụ:
  "Nguồn: Giáo trình/Session 10/Session 11/Session 12."

2. Nếu câu hỏi không tìm thấy dữ liệu rõ ràng trong giáo trình, slide, knowledge base hoặc vector store:
- Bắt buộc mở đầu bằng đúng câu:
  "Hiện tại trong giáo trình không nhắc tới nội dung này, nhưng theo dữ liệu bên ngoài thì:"
- Sau đó mới được trả lời bằng kiến thức tham khảo bên ngoài nếu câu hỏi phù hợp.
- Nếu có nguồn bên ngoài đáng tin cậy trong dữ liệu được cung cấp, hãy đưa nguồn cho người dùng.
- Nếu không có nguồn rõ ràng, phải nói:
  "Phần này chỉ là thông tin tham khảo, chưa có nguồn đối chiếu trong giáo trình."
- Tuyệt đối không được nói rằng giáo trình/slide có đề cập nếu không có căn cứ.

Nguyên tắc trả lời:
- Luôn trả lời bằng tiếng Việt.
- Trả lời ngắn gọn, đúng trọng tâm, dễ dùng cho học tập và thuyết trình.
- Với câu hỏi khái niệm: nêu ý chính trước, sau đó giải thích ngắn.
- Với câu hỏi phân tích/thuyết trình: trình bày theo gạch đầu dòng rõ ràng.
- Với câu hỏi so sánh: tách điểm giống, điểm khác, kết luận ngắn.
- Nếu câu hỏi mơ hồ, hãy trả lời theo hướng gần nhất với Chương 3 hoặc hỏi lại nhẹ nhàng.
- Không bịa rằng giáo trình, slide hoặc tài liệu đã nêu điều gì nếu không có căn cứ.

Quy ước học thuật cần giữ:
- Viết đúng tên môn: Tư tưởng Hồ Chí Minh.
- Khi hỏi "Đại hội nào nêu cao tư tưởng Hồ Chí Minh", trả lời theo giáo trình là Đại hội đại biểu toàn quốc lần thứ VII của Đảng (năm 1991). Không nhầm với Đại hội XI/Cương lĩnh 2011, vốn liên quan đến việc nêu/diễn đạt khái niệm Tư tưởng Hồ Chí Minh trong Cương lĩnh bổ sung, phát triển.
- Luôn viết rõ "độc lập dân tộc gắn liền với chủ nghĩa xã hội" khi bàn về mối quan hệ trung tâm của chương 3.

Dữ liệu nền từ slide Chương 3:
${chapter3Knowledge}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error ?? "Đã có lỗi xảy ra khi kết nối mô hình AI.");
  }
}

function isRateLimitError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("429") ||
    normalized.includes("rate limit") ||
    normalized.includes("quota") ||
    normalized.includes("resource exhausted") ||
    normalized.includes("too many requests")
  );
}

function isApiKeyError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("api key") ||
    normalized.includes("incorrect api key") ||
    normalized.includes("invalid api key") ||
    normalized.includes("unauthorized") ||
    normalized.includes("permission denied") ||
    normalized.includes("forbidden") ||
    normalized.includes("403") ||
    normalized.includes("401")
  );
}

function isServerBusyError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("503") ||
    normalized.includes("service unavailable") ||
    normalized.includes("overloaded") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("bad gateway") ||
    normalized.includes("502") ||
    normalized.includes("gateway timeout") ||
    normalized.includes("504")
  );
}

function isNotFoundError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("404") || normalized.includes("not found");
}

function normalizeHistory(history: ChatHistoryItem[]) {
  if (!Array.isArray(history)) return "";

  return history
    .map((item) => {
      const role = item.role === "model" ? "Trợ lý" : "Người dùng";
      const content = Array.isArray(item.parts)
        ? item.parts.map((part) => part?.text || "").filter(Boolean).join("\n")
        : "";

      if (!content.trim()) return "";

      return `${role}: ${content}`;
    })
    .filter(Boolean)
    .join("\n");
}

function buildTools() {
  const vectorStoreIds = [
    chapter3VectorStoreId,
    textbookVectorStoreId,
    legacyVectorStoreId,
  ].filter(Boolean);

  const uniqueVectorStoreIds = [...new Set(vectorStoreIds)];
  if (uniqueVectorStoreIds.length === 0) return [];

  return [
    {
      type: "file_search" as const,
      vector_store_ids: uniqueVectorStoreIds,
      max_num_results: Number.isFinite(fileSearchMaxResults) ? fileSearchMaxResults : 6,
    },
  ];
}

export const getChatResponse = async (
  message: string,
  history: ChatHistoryItem[]
): Promise<string> => {
  if (!ai) {
    return "Chưa cấu hình VITE_LLM_API_KEY trong file .env.local nên chatbot AI chưa hoạt động.";
  }

  const historyText = normalizeHistory(history);
  const configuredStores = [
    chapter3VectorStoreId ? `chapter 3: ${chapter3VectorStoreId}` : "",
    textbookVectorStoreId ? `giáo trình: ${textbookVectorStoreId}` : "",
    legacyVectorStoreId ? `legacy: ${legacyVectorStoreId}` : "",
  ].filter(Boolean);

  const retrievalStatus =
    configuredStores.length > 0
      ? `Vector store hiện tại: ${configuredStores.join(
          "; "
        )}. Khi dùng file_search, ưu tiên kết quả thuộc Chương 3 trước, sau đó mới dùng giáo trình rộng hơn.`
      : "Chưa cấu hình vector store. Hãy trả lời dựa trên dữ liệu nền từ slide và nói rõ khi thiếu căn cứ giáo trình.";

  const input = `
${SYSTEM_INSTRUCTION}

Trạng thái truy xuất tài liệu:
${retrievalStatus}

Lịch sử hội thoại:
${historyText || "(chưa có)"}

Câu hỏi hiện tại:
${message}
  `.trim();

  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const tools = buildTools();

      const response = await ai.responses.create({
        model,
        input,
        temperature: 0.35,
        ...(tools.length > 0 ? { tools } : {}),
      });

      const text = response.output_text?.trim();

      if (text) return text;

      return "Mình chưa tạo được phản hồi. Bạn thử hỏi lại ngắn gọn hơn nhé.";
    } catch (error) {
      lastError = error;
      const rawMessage = getErrorMessage(error);

      console.error(`Error calling responses API (attempt: ${attempt + 1}):`, error);

      if (isApiKeyError(rawMessage)) {
        return "API key hiện không dùng được hoặc không hợp lệ. Hãy kiểm tra lại VITE_LLM_API_KEY.";
      }

      if (isNotFoundError(rawMessage)) {
        return "Không tìm thấy model hoặc vector store hiện tại. Hãy kiểm tra lại VITE_LLM_MODEL và các biến vector store trong file .env.local.";
      }

      if (isRateLimitError(rawMessage) || isServerBusyError(rawMessage)) {
        if (attempt < 2) {
          await sleep(1200 * (attempt + 1));
          continue;
        }
        break;
      }

      return "Xin lỗi, đã có lỗi xảy ra khi kết nối với mô hình AI.";
    }
  }

  const finalMessage = getErrorMessage(lastError);

  if (isRateLimitError(finalMessage) || isServerBusyError(finalMessage)) {
    return "Hệ thống AI đang quá tải tạm thời. Bạn thử lại sau vài giây nhé.";
  }

  if (isApiKeyError(finalMessage)) {
    return "API key hiện không dùng được hoặc không hợp lệ. Hãy kiểm tra lại VITE_LLM_API_KEY.";
  }

  if (isNotFoundError(finalMessage)) {
    return "Không tìm thấy model hoặc vector store hiện tại. Hãy kiểm tra lại VITE_LLM_MODEL và các biến vector store trong file .env.local.";
  }

  return "Xin lỗi, đã có lỗi xảy ra khi kết nối với mô hình AI.";
};

export const generateImage = async (_prompt: string): Promise<string | null> => {
  return null;
};