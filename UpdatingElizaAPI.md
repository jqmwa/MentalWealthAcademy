Integrate elizaOS Cloud with official SDKs and community libraries.

Quick Start
Since elizaOS Cloud is 100% OpenAI API compatible, you can use any existing OpenAI SDK by simply changing the base URL. No special SDK required!

import OpenAI from 'openai';
 
const client = new OpenAI({
apiKey: process.env.ELIZA_API_KEY,
baseURL: 'https://elizacloud.ai/api/v1',
});
 
const response = await client.chat.completions.create({
model: 'gpt-4o',
messages: [{ role: 'user', content: 'Hello!' }],
});
 
console.log(response.choices[0].message.content);


elizaOS-Specific APIs
For APIs that extend beyond OpenAI compatibility (images, video, voice), use direct HTTP calls:

Image Generation


elizaOS-Specific APIs
For APIs that extend beyond OpenAI compatibility (images, video, voice), use direct HTTP calls:

Image Generation
