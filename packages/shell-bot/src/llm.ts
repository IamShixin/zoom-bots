import { type BaseLLMParams, LLM } from '@langchain/core/language_models/llms';

import config from './config';
import * as fs from 'fs';
const apiUrl = config.API_URL;

export interface GPTInputs extends BaseLLMParams {
  /**
   * What sampling temperature to use.
   * Should be a double number between 0 (inclusive) and 1 (inclusive).
   */
  temperature?: number;

  /**
   * Maximum limit on the total number of tokens
   * used for both the input prompt and the generated response.
   */
  maxTokens?: number;

  /** Model name to use. */
  model?: string;

  /**
   *  Cloud Api Key for service account
   * with the `ai.languageModels.user` role.
   */
  apiKey?: string;

  /**
   *  Cloud IAM token for service account
   * with the `ai.languageModels.user` role.
   */
}
function formatGatewayResponse(response: any) {
  const result = response?.result;
  if (result === undefined) {
    console.error(`Error calling the models`);
  }
  if (typeof result === 'string') {
    return result;
  } else if (typeof result === 'object' && result[0]) {
    return result.reduce((acc: string, cur: string) => acc + cur, '');
  }
  return result;
}
export class GPT extends LLM implements GPTInputs {
  lc_serializable = true;

  static lc_name() {
    return ' GPT';
  }

  temperature = 0.6;

  maxTokens = 1700;

  model = 'general';

  constructor(fields?: GPTInputs) {
    super(fields ?? {});

    this.maxTokens = fields?.maxTokens ?? this.maxTokens;
    this.temperature = fields?.temperature ?? this.temperature;
    this.model = fields?.model ?? this.model;
  }

  _llmType() {
    return 'gpt';
  }

  async _call(
    prompt: string,
    options: this['ParsedCallOptions'],
  ): Promise<string> {
    // Hit the `generate` endpoint on the `large` model
    return this.caller.callWithOptions({ signal: options.signal }, async () => {
      // todo

      try {
        // fs.writeFileSync('prompt.txt', prompt);
        console.log(`~~~~~~~~~~~~~~~~~~~`);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.GATEWAY_TOKEN}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                message: prompt,
              },
            ],
            model: 'gpt-4-32k',
            task_id: '345',
            top_p: 0,
            max_tokens: 23000,
            choices: 1,
            user_name: 'user',
            temperature: 0,
          }),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${apiUrl} from GPT: ${response.status}`,
          );
        }

        const responseData = await response.json();
        return formatGatewayResponse(responseData);
      } catch (error) {
        console.log(`Error calling the models ${error}`);
        throw new Error(`error: ${error}`);
      }
    });
  }
}
