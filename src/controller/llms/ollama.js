import ollama from 'ollama';
import { addToPulling } from '../download/progressHandler.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const chatGeneration = async (model, content) => {
    const resGenerator = await ollama.chat({
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
            id: name,
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
    addToPulling({
        name: model,
        generator: await ollama.pull({ model, stream: true }),
        total: 0,
        completed: -1
    });
};
const MODELS_LIST = JSON.parse(fs.readFileSync(path.join(__dirName, 'ollama_models.json'), 'utf-8'));
export { chatGeneration, getInstalledModelList, getModelList, isOllamaServicing, pullModel };
