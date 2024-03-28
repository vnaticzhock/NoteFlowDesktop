import './ChatBotMainPage.scss'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import WavesIcon from '@mui/icons-material/Waves'
import { Button, MenuItem, Select, TextField } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
  chatGeneration,
  DEFAULT_MODELS,
  fetchNode,
  getChatGPTDefaultApiKey,
  getInstalledModelList,
  getPhoto,
  isOllamaServicing,
  insertNewHistory
} from '../../apis/APIs'
import { useFlowController } from '../../providers/FlowController'
import { ListComponent } from '../Common/Mui'
import { MessageContent, MessageStream } from '../../types/extendWindow/chat'
import { ChatBotProp, HistoryListAction, HistoryState } from './ChatBot'
import { fetchMessages } from '../../apis/APIs'

type MessageState = {
  messages: MessageContent[]
}

type MessageActions = {
  streamly: (message: MessageStream) => void
  push: (initialized: MessageContent) => void
  initialize: (messages: MessageContent[]) => void
}

type Models = string[]

const useMessagesStore = create<MessageState & MessageActions>()(
  immer(set => ({
    messages: [],
    streamly: (data: MessageStream): void =>
      set(state => {
        const { content } = data
        state.messages[state.messages.length - 1].content = content
      }),
    push: (initialized: MessageContent): void =>
      set(state => {
        state.messages.push(initialized)
      }),
    initialize: (messages: MessageContent[]): void =>
      set(state => {
        state.messages = messages
      })
  }))
)

type MainPageProps = {
  updateHistory: HistoryListAction['update']
  insertHistory: HistoryListAction['insert']
  newMessages: () => void
  setHistory: React.Dispatch<React.SetStateAction<HistoryState | null>>
  chatHistory: HistoryState | null
  closeModal: ChatBotProp['closeModal']
  isOllama: boolean
}

const ChatBotMainPage = ({
  closeModal,
  chatHistory,
  isOllama,
  updateHistory,
  insertHistory,
  newMessages,
  setHistory
}: MainPageProps): React.JSX.Element => {
  // 選擇適當的模型
  const [model, setModel] = useState<string>('')
  const [models, setModels] = useState<string[]>([])

  const [content, setContent] = useState<string>('')
  // const [parentMessageId, setParentMessageId] = useState<string | null>(null)
  // const [id, setId] = useState<number>(-1)

  const messages = useMessagesStore(store => store.messages)
  const push = useMessagesStore(store => store.push)
  const streamly = useMessagesStore(store => store.streamly)
  const initialize = useMessagesStore(store => store.initialize)

  const { selectedNodes } = useFlowController()

  const handleSubmit = useCallback(async () => {
    // 送出訊息，推送訊息到大型語言模型及訊息列中
    const messages = content
    if (content === '') {
      closeModal()
      return
    }
    push({ role: 'user', content: content })
    push({ role: 'assistant', content: '' })
    setContent('')

    const id = chatHistory ? chatHistory.id : -1
    const parentMessageId = chatHistory
      ? chatHistory.parentMessageId
      : undefined

    const res = await chatGeneration({
      model,
      content: messages,
      id: id,
      parentMessageId: parentMessageId,
      callback: streamly
    })

    if (chatHistory) {
      // chat history is present so that we have its id
      updateHistory({
        id: id,
        parentMessageId: res.parentMessageId,
        name: chatHistory.name,
        model: chatHistory.model
      })
    } else {
      const newState = {
        id: res.id,
        parentMessageId: res.parentMessageId,
        name: content.slice(0, 7),
        model: model
      }
      insertHistory(newState)
      setHistory(newState)
    }
  }, [updateHistory, content, model, chatHistory])

  useEffect(() => {
    let current_models: Models = []

    const register = (): void => {
      if (current_models.length > 0) {
        setModels(current_models)
        setModel(current_models[0])
      }
    }
    void getChatGPTDefaultApiKey().then(res => {
      if (res) {
        current_models = current_models.concat(DEFAULT_MODELS)
      }

      void isOllamaServicing().then(res => {
        if (res) {
          void getInstalledModelList().then(res => {
            current_models = current_models.concat([
              ...res.map(each => each.name)
            ])
            register()
          })
        } else {
          register()
        }
      })
    })
  }, [isOllama])

  useEffect(() => {
    if (!chatHistory) return
    // 去 fetch 這個 dialog 所有歷史的對話並且 print 出來
    void fetchMessages(chatHistory.id, 10).then(res => initialize(res))
    void setModel(chatHistory.model)
    // void setParentMessageId(chatHistory.parentMessageId)
    // void setId(chatHistory.id)
  }, [chatHistory])

  const ModelSelect = useMemo(() => {
    return models.length > 0 ? (
      <Select
        value={model}
        onChange={e => setModel(e.target.value)}
        sx={{
          fontWeight: 550,
          '.MuiOutlinedInput-notchedOutline': {
            // borderColor: 'rgba(228, 219, 233, 0.25)',
            border: 'none'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(228, 219, 233, 0.25)'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(228, 219, 233, 0.25)'
          }
        }}
        IconComponent={() => <KeyboardArrowDownIcon />}>
        {models.map((name, i) => {
          return (
            <MenuItem key={`model-select-${i}`} value={name}>
              {name}
            </MenuItem>
          )
        })}
      </Select>
    ) : (
      <></>
    )
  }, [models, model])

  useEffect(() => {
    if (chatHistory && chatHistory.model === model) {
      return
    }
    newMessages()
    initialize([])
  }, [model])

  return (
    <div className="chatbot-window">
      <div className="mainpage-handler">
        <div className="header-handler">{ModelSelect}</div>
        <div className="main">
          <div className="message-handler">
            <div className="messages">
              {messages.map((each, i) => {
                const { role, content } = each
                return (
                  <MessageComponent
                    key={`messages-component-${i}`}
                    role={role}
                    content={content}
                  />
                )
              })}
            </div>
            <div className="input-bar">
              <TextField
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="發送訊息給 Chatbot"
                InputProps={{
                  sx: { borderRadius: '20px' },
                  endAdornment: (
                    <Button
                      onClick={handleSubmit}
                      style={{
                        backgroundColor: content == '' ? '#f0f0f0' : '#0e1111',
                        color: 'white'
                      }}>
                      <ArrowUpwardIcon />
                    </Button>
                  )
                }}
                sx={{
                  width: '100%',
                  '& label.Mui-focused': {
                    color: '#f0f0f0'
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: '#f0f0f0'
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#f0f0f0'
                    },
                    '&:hover fieldset': {
                      borderColor: '#f0f0f0'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f0f0f0'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <ListComponent
          subtitle={'Nodes'}
          listItems={selectedNodes.map(each => {
            return {
              icon: WavesIcon,
              text: each,
              onClick: (): void => {
                void fetchNode(each).then(res => {
                  if (!res) return
                  push({ role: 'system', content: res.content })
                })
              }
            }
          })}
          sx={{ flex: 7.5, minWidth: '150px' }}
        />
      </div>
    </div>
  )
}

const MessageComponent = ({
  role,
  content
}: MessageContent): React.JSX.Element => {
  const [isHover, setIsHover] = useState(false)

  const [src, setSrc] = useState('http://localhost:3000/fake.png')

  useEffect(() => {
    if (role === 'user') {
      void getPhoto().then(res => {
        if (res) {
          setSrc(res.avatar)
        }
      })
    }
  }, [])

  return (
    <div
      className="message-container"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}>
      <div className="avatar-container">
        <img className="avatarImg" src={src}></img>
      </div>
      <div className="message-mezzaine">
        <div className="nickname">{role}</div>
        <div className="content">{content}</div>
        <div className="tools">
          {isHover ? <ModeEditIcon sx={{ width: '20px' }} /> : <></>}
        </div>
      </div>
    </div>
  )
}

export default ChatBotMainPage
export type { MessageStream }
