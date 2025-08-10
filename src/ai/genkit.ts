import {genkit} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

async function initializeGenkit() {
  const aiInstance = await configureGenkit({
    plugins: [
      googleAI({
        apiVersion: 'v1beta',
      }),
    ],
    logLevel: 'debug',
    enableTracing: true,
  });
  enableFirebaseTelemetry();
  return aiInstance;
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});
