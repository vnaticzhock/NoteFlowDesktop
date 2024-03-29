import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import { mainWindow } from '../../../main.js';
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
    return {
        language: 'en',
        model: path.join(__whisper_path, 'models/ggml-base.en.bin'),
        use_gpu: true
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
            chunk: -1
        };
        mainWindow.webContents.send('whisper-response', response);
    });
};
const whisperStopListening = () => {
    stop_generation();
    console.log('whisper is stopping from working. (async)');
};
export { whisperStartListening, whisperStopListening };
