import dotenv from 'dotenv';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { mainWindow } from '../../../main.js';
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
const { start_generation, stop_generation } = require(path.join(__whisper_path, 'build/Release/whisper-stream'));
const fetchParams = () => {
    const configs = fetchConfig('', 'whisper');
    const language = configs.default_model.includes('en') ? 'en' : 'auto';
    return {
        language: language,
        model: path.join(__whisper_path, `models/ggml-${configs.default_model}.bin`),
        use_gpu: true,
        length_ms: configs.length_ms,
        step_ms: configs.step_ms,
        keep_ms: configs.keep_ms,
        max_tokens: configs.max_tokens_in_stream,
        vad_threshold: configs.vad_threshold,
        no_timestamps: configs.no_timestamps
    };
};
const whisperStartListening = () => {
    const params = fetchParams();
    const streamAsync = util.promisify(start_generation);
    let current_chunk = 0;
    const whisperParams = {
        ...params,
        onProgress: (...args) => {
            const result = Array.from(args).join('');
            // non-VAD NEW LINE handler.
            if (result === '[NEW LINE]') {
                current_chunk += 1;
                return;
            }
            const response = {
                role: 'whisper',
                content: result,
                done: false,
                chunk: current_chunk
            };
            mainWindow.webContents.send('whisper-response', response);
        }
    };
    streamAsync(whisperParams).then(res => {
        const response = {
            role: 'whisper',
            content: '',
            done: true,
            chunk: current_chunk + 1
        };
        mainWindow.webContents.send('whisper-response', response);
    });
};
const whisperStopListening = () => {
    stop_generation();
    console.log('whisper is stopping from working. (async)');
};
export { whisperStartListening, whisperStopListening };
