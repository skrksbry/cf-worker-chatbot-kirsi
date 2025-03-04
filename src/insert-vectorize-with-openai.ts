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

	// Create OpenAI instance for embeddings
	const openai = new OpenAI({
		apiKey: '#your-openai-api-key#',
	});

	// Generate embedding using OpenAI
	// Use 768 dimensions for fast and efficient Vector search. ( Increasing the dimensionality adversely affects the search performance. )
	// For Korean embeddings, use the openAI model "text-embedding-3-small".
	const embedding = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: content,
		encoding_format: 'float',
		dimensions: 768,
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
