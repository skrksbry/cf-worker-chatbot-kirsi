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

	// Prompt to use to complete the chat (replace with your own prompt!)
	// The "llama-2-7b-chat-int8" model does not support multiple languages, so English is used here.
	// ex) const prompt = `You are a helpful assistant, the mascot of a tech blog. You respond in blunt English and primarily recommend blog posts. Answer in less than 200 characters.`;
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
