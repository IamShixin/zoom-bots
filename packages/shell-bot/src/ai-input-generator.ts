import { AIMessage, HumanMessage } from '@langchain/core/messages';

import * as fs from 'fs';
import { GPT } from './llm';
import CodebaseService from './codebase-service';
import { ChatHistory } from './chat-history';
import IOHandler from './io-handler';

// const roleDescription = `
//   I want you to act as a Vue.js migration assistant.
//   I will provide you with a Vue2 code, and you will migrate it to Vue3 Composition API and use Typescript .
//   I want you to only reply with the Vue3 code in a markdown file, and nothing else,
//   rules:
//     1. do not use <script setup> language feature.
//     2. when find found some code is not possible to migrate, add a comment that start with @ai deprecated and the reason.
//     3. vuex to pinia migration is required.
//     4.
//   do not write explanations.
// `;
const roleDescription = `
  I will provide you with documents and demo code using Vue.js versions Vue2 and Vue3. 
  Please compare the <zm-input-number> input-number components between Vue2 and Vue3,
  listing only the properties, methods, and events that are added or removed in Vue3. 
  Present the differences in a markdown table format, excluding unchanged items. Keep the comparison simple and clear,
  do not write explanations. only the differences. only the markdown table.

`;

const TOKEN_LIMIT_FOR_CHAT_HISTORY = 1000;
const TOEKN_LIMIT_FOR_FILE_CONTENTS = 25000;

class AIInputGenerator {
  private codebaseService: CodebaseService;
  private chatHistory: ChatHistory;
  private ioHandler: IOHandler;

  constructor(
    codebaseService: CodebaseService,
    chatHistory: ChatHistory,
    ioHandler: IOHandler,
  ) {
    this.codebaseService = codebaseService;
    this.chatHistory = chatHistory;
    this.ioHandler = ioHandler;
  }

  async generateForChatModel(chatModel: GPT, userInput: string) {
    // Find relevant files and read their contents
    const relevantFilePaths = await this.codebaseService.findRelevantFiles(
      userInput,
    );
    const fileContentMessages = await this.getMessagesForTokenLimit(
      chatModel,
      relevantFilePaths,
      TOEKN_LIMIT_FOR_FILE_CONTENTS,
    );

    // Send the last 1000 tokens of chat history to the AI
    const chatMessages = await this.chatHistory.getMessagesForTokenLimit(
      chatModel,
      TOKEN_LIMIT_FOR_CHAT_HISTORY,
    );
    const code = await fs.readFileSync(
      './data-internal/original/edit-smart-playlist-dialog.vue',
      'utf-8',
    );
    const messages = [
      new AIMessage(roleDescription),
      // new HumanMessage(
      //   `original vue2 code:
      //    code start >>>>>>>>>>>>>>>>
      //     ${code}
      //     <<<<<<<<<<<<<<<<< code end,
      //   `,
      // ),
      ...fileContentMessages,
      ...chatMessages,
    ];

    return messages;
  }

  private async getMessagesForTokenLimit(
    chatModel: GPT,
    filePaths: string[],
    tokenLimit: number,
  ): Promise<AIMessage[]> {
    let tokens = 0;
    const messages: AIMessage[] = [];
    for (const filePath of filePaths) {
      const content = this.codebaseService.readFileContent(filePath);
      const tokensUsed = await chatModel.getNumTokens(content);

      if (tokens + tokensUsed <= tokenLimit) {
        tokens += tokensUsed;
        messages.push(
          new AIMessage(`\nHere is the content of ${filePath}:\n\n${content}`),
        );
      } else {
        break;
      }
    }

    return messages;
  }
}

export default AIInputGenerator;
