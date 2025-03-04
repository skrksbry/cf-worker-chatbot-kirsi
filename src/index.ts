import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';

const app = new Hono();

// If you want to use this workers as API, apply CORS settings!

// app.use(
// 	'*',
// 	cors({
// 		origin: ['https://your-domain.com'], // Only allow requests from specific URL
// 		allowMethods: ['GET', 'POST'],
// 	})
// );

app.get('/', async (context: Context<{ Bindings: Env }>) => {
	
	return context.text('Hello World!', 200);
});

export default app;
