import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import { fetchConfig } from '../llms/parameters.js';
const projectPath = '../../..';
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
dotenv.config({
    path: path.join(__dirname, projectPath, '.env')
});
process.env.GGML_METAL_PATH_RESOURCES = path.resolve(__dirname, projectPath, process.env.GGML_METAL_PATH_RESOURCES);
const __whisper_path = process.env.GGML_METAL_PATH_RESOURCES;
const require = createRequire(import.meta.url);
const { whisper } = require(path.join(__whisper_path, 'build/Release/whisper-addon'));
const fetchParams = () => {
    const configs = fetchConfig('', 'whisper');
    const language = configs.default_model.includes('en') ? 'en' : 'auto';
    return {
        language: language,
        model: path.join(__whisper_path, `models/ggml-${configs.default_model}.bin`),
        use_gpu: true
    };
};
const whisperTask = async (_, file_name) => {
    const whisperParams = fetchParams();
    whisperParams.fname_inp = file_name;
    const streamAsync = util.promisify(whisper);
    const res = await streamAsync(whisperParams);
    return res;
};
export { whisperTask };
