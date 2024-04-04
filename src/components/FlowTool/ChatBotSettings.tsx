import React from 'react'
import './ChatBotSettings.scss'
import { Button } from '@mui/material'

const ChatBotSettings = (): React.JSX.Element => {
  return (
    <div className="chatbot-settings-window">
      <div className="params-frame">
        <div className="frame">
          <div className="options-tips noselect">
            <img
              className="ollama-img"
              src="http://localhost:3000/ollama.png"></img>
            <div className="bulletin">Ollama</div>
            {/* <div className="default">Default</div> */}
          </div>
          <div className="option">
            <span title="number of context used" className="option-title">
              num_ctx
            </span>
            <span>4096</span>
          </div>
          <div className="option">
            <span>temperature</span>
            <span>0.7</span>
          </div>
          <div className="option">
            <span>tfs_z</span>
            <span>1</span>
          </div>
          <div className="option">
            <span>top_k</span>
            <span>40</span>
          </div>
          <div className="option">
            <span>top_p</span>
            <span>0.9</span>
          </div>
          <div className="options-tips noselect">
            <img
              className="chatgpt-img"
              src="http://localhost:3000/chatgpt.png"></img>
            <div className="bulletin">ChatGPT</div>
          </div>
          <div className="option">
            <span>frequency_penalty</span>
            <span>0</span>
          </div>
          <div className="option">
            <span>max_tokens</span>
            <span>-1</span>
          </div>
          <div className="option">
            <span>temperature</span>
            <span>1</span>
          </div>
          <div className="option">
            <span>top_p</span>
            <span>1</span>
          </div>
        </div>
        <div className="frame">
          <div className="options-tips noselect">
            <img
              className="ollama-img"
              src="http://localhost:3000/whisper.png"></img>
            <div className="bulletin">Whisper</div>
          </div>
          <div className="option">
            <span>use_gpu</span>
            <span>1</span>
          </div>
          <div className="option">
            <span>no_timestamps</span>
            <span>1</span>
          </div>
          <div className="option">
            <span>length_ms</span>
            <span>10000</span>
          </div>
          <div className="option">
            <span>step_ms</span>
            <span>3000</span>
          </div>
          <div className="option">
            <span>keep_ms</span>
            <span>200</span>
          </div>
          <div className="option">
            <span>max_tokens(stream)</span>
            <span>32</span>
          </div>
          <div className="option">
            <span>use_vad</span>
            <span>1</span>
          </div>
          <div className="option">
            <span>vad_thold</span>
            <span>0.6</span>
          </div>
        </div>
      </div>
      <div className="footbar">
        <Button disableRipple sx={{ color: 'grey' }}>
          Cancel
        </Button>
        <Button disableRipple sx={{ color: 'grey' }}>
          Apply
        </Button>
      </div>
    </div>
  )
}

export default ChatBotSettings
