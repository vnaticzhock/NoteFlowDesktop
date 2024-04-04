import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { addToPulling, filterProgress } from '../download/progressHandler.js';
import { fileURLToPath } from 'url';
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const whisperCppFolder = path.join(__dirName, '../../../whisper.cpp');
const valid_models = fs
    .readFileSync(path.join(__dirName, '/valid_model.txt'), 'utf-8')
    .split('\n');
const isValidModels = (path) => {
    return valid_models.includes(path);
};
const isInstalledModels = (model) => {
    const file_name = `ggml-${model}.bin`;
    const file_path = path.join(whisperCppFolder, 'models', file_name);
    return fs.existsSync(file_path);
};
const listUserWhisperModels = () => {
    const uninstalled = [];
    const installed = valid_models.filter(each => {
        const is = isInstalledModels(each);
        if (!is) {
            uninstalled.push(each);
        }
        return is;
    });
    return {
        installed,
        uninstalled
    };
};
const listAllModels = () => {
    return valid_models;
};
const downloadModel = async (_, model) => {
    if (!isValidModels(model)) {
        return false;
    }
    if (isInstalledModels(model)) {
        return false;
    }
    const command = `bash ${whisperCppFolder}/models/download-ggml-model.sh ${model}`;
    console.log(`Downloading whisper model with command: "${command}"`);
    const downloading = {
        name: model,
        total: 100,
        completed: 0
    };
    addToPulling(downloading);
    const child = exec(command);
    child.stdout?.on('data', data => {
        console.log(data);
    });
    let lastPercentage = '';
    child.stderr?.on('data', data => {
        const progressRegex = /[\d]+\%/;
        const result = data.match(progressRegex);
        if (!result)
            return;
        const percentage = result[0];
        if (percentage != lastPercentage) {
            lastPercentage = percentage;
            downloading.completed = parseInt(percentage.slice(0, -1));
        }
    });
    child.on('close', code => {
        downloading.completed = 100;
        filterProgress(downloading.name);
    });
    return true;
};
export { listAllModels, listUserWhisperModels, downloadModel };
