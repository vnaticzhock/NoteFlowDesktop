import { mainWindow } from '../../../main.js';
import { chatGeneration as chatGPTGeneration } from './chatgpt.js';
import { chatGeneration as ollamaGeneration } from './ollama.js';
import { fetchMessages, storeMessages } from './chatState.js';
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
    let { parentMessageId } = data;
    let answer = '';
    const callback = (data) => {
        // webContent 在 main.js 找得到 attribute
        answer = data.content;
        mainWindow.webContents.send('chatbot-response', data);
    };
    if (OPENAI_MODELS.includes(model)) {
        // openai
        if (model === 'GPT-4') {
            return {
                role: 'Yoho',
                text: '太貴了先不要亂用! (可以到 controller/llms/generation.js 把這個 fake hub 關掉）',
                parentMessageId: 'fake-hub-1234'
            };
        }
        const res = await chatGPTGeneration({ content, model, callback });
        parentMessageId = res.parentMessageId;
    }
    else {
        const messages = parentMessageId
            ? [...fetchMessages(parentMessageId, 5), { role: 'user', content }]
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
    // After getting async generator, start iterate for result
    const chatbotSay = { role: 'assistant', content: answer };
    storeMessages([{ role: 'user', content }, chatbotSay], parentMessageId);
    // 配合 chatGPT 回傳的 schema
    return {
        ...chatbotSay,
        parentMessageId
    };
};
export { chatGeneration };
