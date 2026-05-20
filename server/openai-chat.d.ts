import type { IncomingMessage } from "node:http";

export class ChatServiceError extends Error {
  statusCode: number;
  cause?: unknown;
  constructor(message: string, statusCode?: number, cause?: unknown);
}

export function createChatResponse(
  payload: unknown,
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
): Promise<{ answer: string; citations: string[] }>;

export function getChatErrorResponse(error: unknown): {
  statusCode: number;
  body: { error: string };
};

export function readJsonBody(req: IncomingMessage): Promise<unknown>;
