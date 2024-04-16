import { Embeddings, type EmbeddingsParams } from '@langchain/core/embeddings';

import config from './config';

export interface AIEmbeddingsParams extends EmbeddingsParams {
  modelName?: string;
  apiKey?: string;
  stripNewLines?: boolean;
}

interface EmbeddingData {
  embedding: number[];
  index: number;
  object: string;
}

export interface AIEmbeddingsResult {
  data: EmbeddingData[];
}

export class AIEmbeddings extends Embeddings implements AIEmbeddingsParams {
  modelName: AIEmbeddingsParams['modelName'] = config.EMBEDDING_MODEL;

  apiKey?: string;

  stripNewLines = true;

  private API_URL = config.EMBEDDING_API_URL;

  constructor(fields?: AIEmbeddingsParams) {
    super(fields ?? {});
    this.apiKey = fields?.apiKey;
    this.modelName = fields?.modelName ?? this.modelName;
    this.stripNewLines = fields?.stripNewLines ?? this.stripNewLines;

    if (!this.apiKey) {
      throw new Error('AI API key not found');
    }
  }

  private async embeddingWithRetry(input: string): Promise<AIEmbeddingsResult> {
    const text = this.stripNewLines ? input?.replace(/\n/g, ' ') || '' : input;

    const body = JSON.stringify({
      input: text,
      model: this.modelName,
      task_id: '123456',
    });
    const headers = {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
      Authorization: `Bearer ${this.apiKey!}`,
    };

    return this.caller.call(async () => {
      const fetchResponse = await fetch(this.API_URL, {
        method: 'POST',
        headers,
        body,
      });
      const data = await fetchResponse.json();
      if (fetchResponse.status === 200) {
        return {
          data: data.embeddings,
        };
      }
      throw new Error(
        `Error getting embeddings from AI. ${JSON.stringify(data, null, 2)}`,
      );
    });
  }

  /**
   * Method to generate an embedding for a single document. Calls the
   * embeddingWithRetry method with the document as the input.
   * @param {string} text Document to generate an embedding for.
   * @returns {Promise<number[]>} Promise that resolves to an embedding for the document.
   */
  async embedQuery(text: string): Promise<number[]> {
    const { data } = await this.embeddingWithRetry(text);
    return data[0].embedding;
  }

  /**
   * Method that takes an array of documents as input and returns a promise
   * that resolves to a 2D array of embeddings for each document. It calls
   * the embedQuery method for each document in the array.
   * @param documents Array of documents for which to generate embeddings.
   * @returns Promise that resolves to a 2D array of embeddings for each input document.
   */
  embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map((doc) => this.embedQuery(doc)));
  }
}
