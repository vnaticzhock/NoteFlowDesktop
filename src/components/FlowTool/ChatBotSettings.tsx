import React, { useEffect, useState } from 'react'
import './ChatBotSettings.scss'
import { Button } from '@mui/material'
import {
  IChatGPTConfigs,
  IOllamaConfigs,
  IWhisperConfigs
} from '../../types/llms/llm'
import { fetchConfig } from 'src/apis/APIs'

type IState = {
  ollama: IOllamaConfigs
  chatgpt: IChatGPTConfigs
  whisper: IWhisperConfigs
}

const ChatBotSettings = (): React.JSX.Element => {
  const [state, setState] = useState<IState>({
    ollama: {
      num_ctx: 4096,
      temperature: 0.7,
      tfs_z: 1,
      top_k: 40,
      top_p: 0.9
    },
    chatgpt: {
      frequency_penalty: 0,
      max_tokens: -1,
      temperature: 1,
      top_p: 1
    },
    whisper: {
      no_timestamps: true,
      length_ms: 10000,
      step_ms: 3000,
      keep_ms: 200,
      max_tokens_in_stream: 32,
      use_vad: true,
      vad_threshold: 0.6
    }
  })

  const getAllConfigs = async (): Promise<IState> => {
    const all_keys = Object.keys(state)
    const configs = await Promise.all(
      all_keys.map(async key => {
        return await fetchConfig(key)
      })
    )

    const result: any = {}
    for (let i = 0; i < all_keys.length; i++) {
      result[all_keys[i]] = configs[i]
    }

    return result
  }

  useEffect(() => {
    void getAllConfigs().then(res => {
      console.log(res)
      setState(res)
    })
  }, [])

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
            <span>{state.ollama.num_ctx}</span>
          </div>
          <div className="option">
            <span>temperature</span>
            <span>{state.ollama.temperature}</span>
          </div>
          <div className="option">
            <span>tfs_z</span>
            <span>{state.ollama.tfs_z}</span>
          </div>
          <div className="option">
            <span>top_k</span>
            <span>{state.ollama.top_k}</span>
          </div>
          <div className="option">
            <span>top_p</span>
            <span>{state.ollama.top_p}</span>
          </div>
          <div className="options-tips noselect">
            <img
              className="chatgpt-img"
              src="http://localhost:3000/chatgpt.png"></img>
            <div className="bulletin">ChatGPT</div>
          </div>
          <div className="option">
            <span>frequency_penalty</span>
            <span>{state.chatgpt.frequency_penalty}</span>
          </div>
          <div className="option">
            <span>max_tokens</span>
            <span>{state.chatgpt.max_tokens}</span>
          </div>
          <div className="option">
            <span>temperature</span>
            <span>{state.chatgpt.temperature}</span>
          </div>
          <div className="option">
            <span>top_p</span>
            <span>{state.chatgpt.top_p}</span>
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
            <span>{state.whisper.no_timestamps}</span>
          </div>
          <div className="option">
            <span>length_ms</span>
            <span>{state.whisper.length_ms}</span>
          </div>
          <div className="option">
            <span>step_ms</span>
            <span>{state.whisper.step_ms}</span>
          </div>
          <div className="option">
            <span>keep_ms</span>
            <span>{state.whisper.keep_ms}</span>
          </div>
          <div className="option">
            <span>max_tokens(stream)</span>
            <span>{state.whisper.max_tokens_in_stream}</span>
          </div>
          <div className="option">
            <span>use_vad</span>
            <span>{state.whisper.use_vad}</span>
          </div>
          <div className="option">
            <span>vad_thold</span>
            <span>{state.whisper.vad_threshold}</span>
          </div>
          <div className="option">
            <span>default model</span>
            <span>-</span>
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
