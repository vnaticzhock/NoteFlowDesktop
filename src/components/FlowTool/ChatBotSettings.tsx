import React, { useEffect, useMemo, useState } from 'react'
import './ChatBotSettings.scss'
import { Button } from '@mui/material'
import Select from 'react-select'
import {
  IChatGPTConfigs,
  IOllamaConfigs,
  IWhisperConfigs
} from '../../types/llms/llm'
import {
  fetchConfig,
  isOllamaServicing,
  listUserWhisperModels
} from 'src/apis/APIs'

type IState = {
  ollama: IOllamaConfigs
  chatgpt: IChatGPTConfigs
  whisper: IWhisperConfigs
}

type ISelect = {
  value: string
  label: string
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
      vad_threshold: 0.6,
      default_model: '-'
    }
  })
  const [isOllama, setIsOllama] = useState<boolean>(false)
  const [whisperModelOpt, setWhisperModelOpt] = useState<ISelect[]>([])
  const [whisperDefModel, setWhisperDefModel] = useState<ISelect | null>({
    value: 'tiny',
    label: 'tiny'
  })

  const getAllConfigs = async (): Promise<IState> => {
    const all_keys: any = Object.keys(state)
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
    void getAllConfigs().then(config => {
      setState(config)
      const whisperDefModel = config.whisper.default_model
      void listUserWhisperModels().then(res => {
        const ls = res.installed.map(each => ({ value: each, label: each }))
        console.log(ls, whisperDefModel)

        setWhisperModelOpt(ls)
        setWhisperDefModel({
          value: whisperDefModel,
          label: whisperDefModel
        })
      })
    })
    void isOllamaServicing().then(isServicing => {
      if (isServicing) {
        setIsOllama(true)
      }
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
              is_running
            </span>
            <span>{isOllama ? 'true' : 'false'}</span>
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
            <span>{state.whisper.use_vad ? 'true' : 'false'}</span>
          </div>
          <div className="option">
            <span>vad_thold</span>
            <span>{state.whisper.vad_threshold}</span>
          </div>
          <div className="option">
            <span>default model</span>
            <Select defaultValue={whisperDefModel} options={whisperModelOpt} />
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

/**
 * default whisper model:
 * 1. 一開始先初始化為 "-"
 * 2. 下載第一個模型的時候，先確認沒有別的 model 被下載
 * 3. 如果真的是這樣，則修改 config 為那個模型
 */

export default ChatBotSettings
