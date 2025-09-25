
import { Client, PollinationsAI, DeepInfra, Together, Puter, HuggingFace }  from 'https://g4f.dev/dist/js/client.js';

// Pollinations
const client = new PollinationsAI({ apiKey: 'optional' });

export async function test_tense() {
    const result = await client.chat.completions.create({
    model: 'deepseek-v3',
    messages: [
        { role: 'system', content: 'You are a helpful assistant that converts sentences to past tense.' },
        { role: 'user', content: 'Prepares agenda, invitation letter, budget for Board of Trustees meeting' }
    ]
    });

    console.log(result.choices[0].message.content);
}

export async function convert_tense(sentence) {
    const result = await client.chat.completions.create({
    model: 'deepseek-v3',
    messages: [
        { role: 'system', content: 'You are a helpful assistant that converts sentences to past tense.' },
        { role: 'user', content: sentence}
    ]
    });
 
    console.log(result.choices[0].message.content);
    return String(result.choices[0].message.content)
}