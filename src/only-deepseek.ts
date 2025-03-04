import { Context, Hono } from 'hono';
import OpenAI from 'openai';

const app = new Hono();

// Endpoint to handle a GET request
app.get('/', async (context: Context<{ Bindings: Env }>) => {
	const question = context.req.query('text') || '';

	// Create an instance of the Deepseek client with the API key
	// Deepseek also uses openai compatible API.
	const openai = new OpenAI({
		apiKey: '#your-deepseek-api-key#',
		baseURL: 'https://api.deepseek.com',
	});

	// Prompt to use to complete the chat (replace with your own prompt!)
	// Deepseek models also supports multiple languages, so we write prompts in Korean.
	// ex) const prompt = `당신은 다양한 주제에 적절한 블로그 게시글을 추천하는 역할입니다. 사용자의 질문에 맞춰 블로그 글을 한글로 추천합니다.`;
	const prompt = ``;

	// Here we use the "deepseek-chat (Deepseek-v3)" model.
	// Deepseek offers great performance for its cost, but may not be suitable for chatbots because it lacks a lightweight model like "gpt-4o-mini".
	// If you need an inference model, use "deepseek-reasoner (Deepseek-R1)"!
	const response = await openai.chat.completions.create({
		model: 'deepseek-chat',
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
