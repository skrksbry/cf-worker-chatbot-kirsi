import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';

const app = new Hono();

// Apply CORS to all routes
app.use(
  '*',
  cors({
    origin: ['https://your-domain.com'], // Only allow requests from specific URL
    allowMethods: ['GET', 'POST'],
  })
);

// Endpoint to handle a GET request
app.get('/', async (context: Context<{ Bindings: Env }>) => {
  const question = context.req.query('text') || '';

  // Create an instance of the OpenAI client with the API key
  const openai = new OpenAI({
    apiKey: 'Your-api-key',
  });

  // Prompt to be used in chat completions
  const prompt = `You are a helpful assistant, the mascot of a tech blog. You respond in blunt Korean and primarily recommend blog posts. Answer in less than 200 characters.`;

  // Using OpenAI API to generate a response
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: question },
    ],
    temperature: 1.1,
    top_p: 1,
  });

  // Using CF model to generate a response (Alternative logic)
  const cfResponse = await context.env.AI.run('@cf/google/gemma-2b-it-lora', {
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: question },
    ],
  });

  // Return OpenAI response or CF AI response based on availability
  return new Response(JSON.stringify({ message: response.choices[0].message.content || cfResponse.response }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
});

// Endpoint to handle a POST request to create a new vector
app.post('/vector-registration', async (context: Context<{ Bindings: Env }>) => {
  // Parse request data
  const { id, content, metadata } = await context.req.json();

  if (!content) return context.text('Missing text', 400);

  // Create OpenAI instance for embeddings
  const openai = new OpenAI({
    apiKey: 'your-api-key',
  });

  // Generate embedding using OpenAI
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
    encoding_format: 'float',
    dimensions: 768,
  });

  const values = embedding.data[0]['embedding'];
  if (!values) throw new Error('Failed to generate vector embedding');

  // Prepare vector data for upsert
  const vectorsToUpsert = [{
    id: `${id}`,
    values: values,
    metadata: metadata,
  }];

  // Insert vectors into VECTORIZE environment
  // If you are not using Cloudflare Vectorize, use a different API endpoint.
  const upsertResult = await context.env.VECTORIZE.upsert(vectorsToUpsert);
  console.log(upsertResult);

  return context.text('Created note', 201);
});

export default app;