let g4fModule = null;

async function getG4F() {
  if (!g4fModule) {
    g4fModule = await import('https://g4f.dev/dist/js/client.js');
  }
  return g4fModule;
}

export async function convert_tense(sentence) {
  const { PollinationsAI } = await import('https://g4f.dev/dist/js/client.js');
  const client = new PollinationsAI({ apiKey: 'optional' });

  const result = await client.chat.completions.create({
    model: 'deepseek-v3',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that converts sentences to past tense.' },
      { role: 'user', content: sentence },
    ],
  });

  return result.choices[0].message.content;
}
