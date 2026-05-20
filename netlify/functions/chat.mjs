import { createChatResponse, getChatErrorResponse } from "../../server/openai-chat.mjs";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: jsonHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed." }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const result = await createChatResponse(payload, process.env);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(result),
    };
  } catch (error) {
    const { statusCode, body } = getChatErrorResponse(error);
    console.error("[api/chat]", error);

    return {
      statusCode,
      headers: jsonHeaders,
      body: JSON.stringify(body),
    };
  }
}
