# HCM learning chatbot

## Run locally

```bash
npm install
npm.cmd run dev
```

Default local URL:

```text
http://localhost:3000
```

## Chatbot configuration

The chatbot runs server-side through `/api/chat`.

Required `.env.local` values:

```text
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_BASE_URL=https://api.freemodel.dev/v1
```

When `OPENAI_BASE_URL` points to an OpenAI-compatible gateway such as freemodel.dev, the chatbot uses local markdown RAG from `knowledge-full/` and `knowledge/`, then appends source file names to the answer.

Local RAG options:

```text
OPENAI_LOCAL_RAG_DIRS=knowledge-full,knowledge
OPENAI_LOCAL_RAG_MAX_CHUNKS=4
```

When using the official OpenAI API, the chatbot can use OpenAI Vector Store/File Search with:

```text
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_VECTOR_STORE_IDS=vs_your_vector_store_id_here
OPENAI_FILE_SEARCH_MAX_RESULTS=6
```

If you need to create an OpenAI vector store, configure an official OpenAI API key and run:

```bash
npm.cmd run upload:hcm-knowledge
```

## Notes

- For Firebase Google login in local development, enable `Google` and `Email/Password` in Firebase Console and add `localhost` to `Authorized domains`.
- If the chatbot does not answer, check `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, and network access to the LLM provider.
