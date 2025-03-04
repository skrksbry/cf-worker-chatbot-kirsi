import { Context, Hono } from 'hono';
import OpenAI from 'openai';

const app = new Hono();
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Vectorize 는 Cloudflare의 Vector database SAAS입니다.
// Vectorize 는 Cloudflare에 통합되어 있음으로 wrangler.jsonc를 수정하여 Workers에 통합해야 사용할 수 있습니다.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// Endpoint to handle a POST request to create a new vector (text)
app.post('/vector-insert', async (context: Context<{ Bindings: Env }>) => {
	// Parse request data
	const { id, content, metadata } = await context.req.json();
	if (!content) return context.text('Missing text', 400);

	// Create an instance of the OpenAI client with the Cloudflare API key
	// *This project uses an OpenAI compatible endpoint.
	const openai = new OpenAI({
		apiKey: '#your-cloudflare-api-key#',
		baseURL: `https://api.cloudflare.com/client/v4/accounts/#your-cloudflare-client-id#/ai/v1`,
	});

	// Generate embedding using Cloudflare AI
	// Unfortunately, Cloudflare model "@cf/baai/bge-base-en-v1.5" only supports 768 dimensions and English.
	const embedding = await openai.embeddings.create({
		model: '@cf/baai/bge-base-en-v1.5',
		input: content,
	});

	const values = embedding.data[0]['embedding'];
	if (!values) throw new Error('Failed to generate vector embedding');

	// Prepare vector data for upsert
	// 이유는 모르겠지만 배열을 upsert메서드에 직접 전달하면 오류가 발생함. ( 버그인듯 )
	const vectorsToUpsert = [
		{
			id: `${id}`,
			values: values,
			metadata: metadata,
		},
	];

	// Vector insert in Vectorize
	// If you are using Redis instead of Vectorize, the method that does the same thing as `upsert` is `HSET`.
	await context.env.SEARCH_INDEX.upsert(vectorsToUpsert);

	return context.text('Inserted Vector', 201);
});

export default app;
