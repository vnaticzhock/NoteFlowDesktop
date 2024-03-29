import { mainWindow } from '../../../main.js';
import { chatGeneration as chatGPTGeneration } from './chatgpt.js';
import { chatGeneration as ollamaGeneration } from './ollama.js';
import { fetchMessages, insertNewHistory, storeMessages } from './chatState.js';
const OPENAI_MODELS = ['GPT-3.5', 'GPT-4'];
/**
 * Schema of chatGPT response:
 * obj {
 *    conversationId: undefined
 *    detail: 使用什麼模型，還有這個訊息在整個系統中的 uid
 *    usage: 產生的 tokens, 包含: completion_token & prompt_token(?)
 *    id: detail 中提到的 uid
 *    parentMessageId: 如果要繼續追問的話，便需要一起送這個字串出去
 *    role: "assistant"
 *    text: "..."
 * }
 */
const chatGeneration = async (_, data) => {
    const { model, content } = data;
    let { parentMessageId, id } = data;
    let answer = '';
    const callback = (data) => {
        // webContent 在 main.js 找得到 attribute
        answer += data.content;
        mainWindow.webContents.send('chatbot-response', data);
    };
    console.log('input:', data);
    if (OPENAI_MODELS.includes(model)) {
        const res = await chatGPTGeneration({
            id,
            content,
            model,
            parentMessageId,
            callback
        });
        // console.log('prev:', res.parentMessageId)
        parentMessageId = res.parentMessageId;
    }
    else {
        const messages = parentMessageId
            ? [...fetchMessages(_, id, 5), { role: 'user', content }]
            : [{ role: 'user', content }];
        if (!parentMessageId) {
            // Generate a parent message id
            parentMessageId = 'local-' + Date.now();
        }
        const resGenerator = await ollamaGeneration(model, messages);
        let progress = await resGenerator.next();
        while (!progress.done) {
            const res = progress.value.message;
            callback({ ...res, done: progress.value.done });
            progress = await resGenerator.next();
        }
    }
    if (id === -1) {
        id = insertNewHistory(_, parentMessageId, data.content, data.model);
    }
    // After getting async generator, start iterate for result
    const chatbotSay = { role: 'assistant', content: answer };
    storeMessages([{ role: 'user', content }, chatbotSay], id);
    // 配合 chatGPT 回傳的 schema
    return {
        ...chatbotSay,
        parentMessageId,
        id
    };
};
export { chatGeneration };
