import { Context, Hono } from 'hono';
import OpenAI from 'openai';

const app = new Hono();

// Endpoint to handle a GET request
app.get('/', async (context: Context<{ Bindings: Env }>) => {
    const question = context.req.query('text') || '';

    // Create an instance of the OpenAI client with the Cloudflare API key
    // *This project uses an OpenAI compatible endpoint.
    const openai = new OpenAI({
        apiKey: '#your-cloudflare-api-key#',
        baseURL: `https://api.cloudflare.com/client/v4/accounts/#your-cloudflare-client-id#/ai/v1`,
    });

    // Embedding the user's question.
    const embedding = await openai.embeddings.create({
        model: '@cf/baai/bge-base-en-v1.5',
		input: question,
    });
    const questionVector = embedding.data[0]['embedding'];

    // Search for similar vectors using query in Vectorize. ( In this case, we find the single most similar value. )
    // Value returned from Vectorize is a vector and cannot be recognized. a separate action is required through a predefined id value.
    const vectorizeResult = await context.env.SEARCH_INDEX.query(questionVector, { topK: 1 });

    // Prompt to use to complete the chat (replace with your own prompt!)
    // OpenAI models support multiple languages, so we write prompts in Korean.
	// ex) const prompt = `당신은 다양한 주제에 적절한 블로그 게시글을 추천하는 역할입니다. 사용자의 질문에 맞춰 블로그 글을 한글로 추천합니다.`;
    // If you have original data obtained via Vectorize: ex) const prompt = `당신은 다양한 주제에 적절한 블로그 게시글을 추천하는 역할입니다. 사용자의 질문에 맞춰 블로그 글을 한글로 추천합니다. 또한 ${document} 내용을 참고하여 답변해야 합니다.`;
    const prompt = ``;

    // Here we use the "llama-2-7b-chat-int8" quantization model.
    // Call the Cloudflare model using an openAI compatible API.
    const response = await openai.chat.completions.create({
        model: '@cf/meta/llama-2-7b-chat-int8',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: question },
        ],
    });

    // Returns the answer in json format.
    return new Response(JSON.stringify({ message: response.choices[0].message.content }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
});

export default app;
