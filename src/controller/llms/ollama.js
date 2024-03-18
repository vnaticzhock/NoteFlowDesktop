import ollama from 'ollama';
import { removeProgressBar, setProgressBar } from '../functionality/progressBar.js';
const chatGeneration = (model, content) => {
    const resGenerator = ollama.chat({
        model: model,
        messages: content,
        stream: true
    });
    return resGenerator;
};
const isOllamaServicing = async () => {
    try {
        await ollama.list();
        return true;
    }
    catch (error) {
        return false;
    }
};
const getInstalledModelList = async () => {
    const model_list = await ollama.list();
    return model_list.models.map(each => {
        const { name, modified_at, digest, parameter_size, quantization_level } = each;
        const model_name = name.split(':')[0];
        const version = name.split(':')[1];
        return {
            name: model_name,
            version,
            modified_at,
            parameter_size,
            quantization_level,
            digest
        };
    });
};
const getModelList = async () => {
    const installedList = await getInstalledModelList();
    const installed = [];
    const uninstalled = [];
    MODELS_LIST.forEach(each => {
        for (let i = 0; i < installedList.length; i++) {
            if (installedList[i].name === each.name) {
                installed.push({
                    ...installedList[i],
                    ...each
                });
                return;
            }
        }
        uninstalled.push(each);
    });
    return {
        installed,
        uninstalled
    };
};
const pullModel = async (_, model) => {
    PULLING_LIST.push({
        name: model,
        generator: await ollama.pull({ model, stream: true }),
        total: 0,
        completed: -1
    });
    // 不回傳結果回去，因為 progress 不能被 clone 到 renderer thread
    // 因此，我們需要在後端處理下載的邏輯 (getPullingProgress)
    void maintainPullingProgress(_);
    // 並且, 後端會一直在處理下載的事情, 前端來問的時候才可以回傳狀態
};
const maintainPullingProgress = async (_) => {
    // TODO: 考慮用多執行緒的方式執行?
    PULLING_LIST.filter(async (each) => {
        const { generator } = each;
        let progress = await generator.next();
        while (!progress.done) {
            const { total, completed } = progress.value;
            const done = progress.done;
            each.total = total;
            each.completed = completed;
            progress = await generator.next();
        }
    });
    const progressInterval = setInterval(() => {
        const progress = PULLING_LIST.reduce((acc, each) => [acc[0] + each[2].total, acc[1] + each[2].completed], [0, 0]);
        const TOTAL = progress[0];
        const COMPLETED = progress[1];
        if (COMPLETED >= TOTAL || PULLING_LIST.length === 0) {
            removeProgressBar();
            clearInterval(progressInterval);
            if (COMPLETED >= TOTAL) {
                PULLING_LIST.length = 0;
            }
        }
        else if (COMPLETED && TOTAL) {
            setProgressBar(_, COMPLETED / TOTAL);
        }
    }, 1000);
};
const isPullingModel = () => {
    console.log('Number of models installing:', PULLING_LIST.length);
    return PULLING_LIST.length !== 0;
};
const getPullingProgress = async (_) => {
    return PULLING_LIST.map(each => {
        const { name, total, completed } = each;
        return {
            name,
            total,
            completed
        };
    });
};
const PULLING_LIST = [];
const MODELS_LIST = [
    {
        id: 'llama2', // ollama pull ... 的時候使用的名字
        name: 'llama2', // 顯示出來的名字
        description: 'Llama 2 is a collection of foundation language models ranging from 7B to 70B parameters.'
    },
    {
        id: 'mistral',
        name: 'mistral',
        description: 'The 7B model released by Mistral AI, updated to version 0.2.'
    },
    {
        id: 'Breeze-7B',
        name: 'Breeze-7B',
        description: `MediaTek Research Breeze-7B (hereinafter referred to as Breeze-7B)
      is a language model family that builds on top of Mistral-7B,
      specifically intended for Traditional Chinese use.`
    },
    {
        id: 'phi',
        name: 'phi',
        description: 'Phi-2: a 2.7B language model by Microsoft Research that demonstrates outstanding reasoning and language understanding capabilities. '
    }
];
export { chatGeneration, getInstalledModelList, getModelList, getPullingProgress, isOllamaServicing, isPullingModel, pullModel };
