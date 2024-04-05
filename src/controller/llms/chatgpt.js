import { ChatGPTAPI } from 'chatgpt';
import { getDefaultApiKey } from './chatgpt_key.js';
import { fetchConfig } from './parameters.js';
const MODEL_MAPPER = {
    'GPT-3.5': 'gpt-3.5-turbo',
    'GPT-4': 'gpt-4'
};
const api = {};
const chatGeneration = async ({ id, content, model, parentMessageId, callback }) => {
    const customConfigs = fetchConfig('', 'chatgpt');
    if (!(model in api)) {
        api[model] = new ChatGPTAPI({
            apiKey: getDefaultApiKey(),
            completionParams: {
                model: MODEL_MAPPER[model],
                ...customConfigs
            }
        });
    }
    let gpt = api[model];
    const key = getDefaultApiKey();
    if (gpt.apiKey !== key) {
        api[model] = new ChatGPTAPI({
            apiKey: getDefaultApiKey(),
            completionParams: {
                model: MODEL_MAPPER[model],
                ...customConfigs
            }
        });
        gpt = api[model];
    }
    const res = await gpt.sendMessage(content, {
        parentMessageId: parentMessageId,
        onProgress: (data) => {
            callback({
                role: data.role,
                content: data.delta ? data.delta : '',
                done: data.delta === undefined
            });
        }
    });
    return {
        parentMessageId: res.id,
        role: res.role,
        content: res.text,
        id
    };
};
export { chatGeneration };
