#!/usr/bin/env node

import { program } from 'commander';

import * as fs from 'fs';

import { GPT } from './llm';
import { AIEmbeddings } from './embedding';

// Import with the .js extension, even though the actual file is a TypeScript file.
// This is because we have "type": "module" in package.json, and Node.js expects the final
// extension of the compiled JavaScript files in the import statement when using ES modules.
import config from './config';
import CodebaseService from './codebase-service';
import { ChatHistory } from './chat-history';
import IOHandler from './io-handler';
import AIInputGenerator from './ai-input-generator';
import VectorStore from './vector-store';

async function main(cleanVectorStore: boolean) {
  const chatHistory = new ChatHistory(200);
  const chat = new GPT({
    apiKey: config.GATEWAY_TOKEN,
    temperature: 0.1,
    maxTokens: 20000,
    model: 'gpt-4',
  });
  const embeddings = new AIEmbeddings({
    apiKey: config.EMBEDDING_API_TOKEN,
    modelName: config.EMBEDDING_MODEL,
  });
  const ioHandler = new IOHandler();
  const codebase = new CodebaseService(
    new VectorStore(embeddings, config.vector_store_local_path),
    ioHandler,
    config.files,
  );
  await codebase.init(cleanVectorStore);

  const aiInputGenerator = new AIInputGenerator(
    codebase,
    chatHistory,
    ioHandler,
  );

  ioHandler.printWelcomeMessage();

  // eslint-disable-next-line no-constant-condition
  // while (true) {
  //   const userInput = await ioHandler.getUserInput(
  //     '\nAsk your question (Enter a blank line to finish input): ',
  //   );
  //   if (userInput.toLowerCase() === 'quit') {
  //     break;
  //   }

  //   chatHistory.addMessage(new HumanMessage(userInput));

  //   try {
  //     ioHandler.showSpinner(true);
  //     const aiResponse = await chat.invoke(messages);
  //     ioHandler.showSpinner(false);

  //     const response = aiResponse;
  //     ioHandler.printAIResponse(response);
  //     chatHistory.addMessage(new AIMessage(response));

  //     // report token usage
  //     // const tokensUsed = await chat.getNumTokensFromMessages(messages);
  //     // totalTokensUsed += tokensUsed.totalCount;

  //     // const gpt35TurboPrice = 0.002;
  //     // const cost = (totalTokensUsed / 1000.0) * gpt35TurboPrice;

  //     // ioHandler.printTokenUsage(tokensUsed.totalCount, totalTokensUsed, cost);
  //   } catch (error: any) {
  //     ioHandler.showSpinner(false);
  //     ioHandler.printError(error);
  //   }
  // }
  // const userInput = await fs.readFileSync(
  //   './data-internal/original/edit-smart-playlist-dialog.vue',
  //   'utf-8',
  // );
  const userInput = `
     <zm-input-number> input-number components based on vue2 and vue3
    and their properties, methods, event
  `;
  const messages = await aiInputGenerator.generateForChatModel(chat, userInput);

  const aiResponse = await chat.invoke(messages);
  console.log(aiResponse);
  fs.writeFileSync('ai-response.md', aiResponse);
  process.exit(0);
}

program.option(
  '-c, --clean-vector-store',
  'Start with a new clean vector store',
);

program.parse();

main(program.opts().cleanVectorStore || false);
