import { ChatGPTAPI } from 'chatgpt';
import { getDefaultApiKey } from './chatgpt_key.js';
const MODEL_MAPPER = {
    'GPT-3.5': 'gpt-3.5-turbo',
    'GPT-4': 'gpt-4'
};
const chatGeneration = async (content, model, options, callback) => {
    const api = new ChatGPTAPI({
        apiKey: getDefaultApiKey(),
        completionParams: {
            model: MODEL_MAPPER[model],
            ...fetchModelConfig()
        }
    });
    const res = await api.sendMessage(content, {
        ...options,
        onProgress: callback
    });
    return res;
};
const fetchModelConfig = () => {
    return {
        temperature: 0.5,
        top_p: 0.8
    };
};
export { chatGeneration };
