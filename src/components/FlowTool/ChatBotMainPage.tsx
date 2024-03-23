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
  getInstalledModelList,
  getPhoto,
  isOllamaServicing
} from '../../apis/APIs'
import { useFlowController } from '../../providers/FlowController'
import { ListComponent } from '../Common/Mui'
import { MessageContent, MessageStream } from '../../types/extendWindow/chat'

type MessageState = {
  messages: MessageContent[]
}

type MessageActions = {
  streamly: (message: MessageStream) => void
  push: (initialized: MessageContent) => void
}

const useMessagesStore = create<MessageState & MessageActions>()(
  immer(set => ({
    messages: [],
    streamly: (data: MessageStream): void =>
      set(state => {
        const { content } = data
        console.log(data)
        state.messages[-1].content = content
      }),
    push: (initialized: MessageContent): void =>
      set(state => {
        state.messages.push(initialized)
      })
  }))
)

const ChatBotMainPage = ({
  closeDialog,
  dialogIdx,
  isOllama,
  updateChatHistories
}) => {
  // 選擇適當的模型
  const [model, setModel] = useState<string>('')
  const [models, setModels] = useState<string[]>([])

  const [content, setContent] = useState<string>('')
  // const [messages, setMessages] = useState<MessageContent[]>([])

  const messages = useMessagesStore(store => store.messages)
  const push = useMessagesStore(store => store.push)
  const streamly = useMessagesStore(store => store.streamly)

  const { selectedNodes } = useFlowController()

  const handleSubmit = useCallback(async () => {
    // 送出訊息，推送訊息到大型語言模型及訊息列中
    const messages = content
    if (content === '') {
      closeDialog()
      return
    }
    push({ role: 'user', content: content })
    push({ role: 'assistant', content: '' })
    setContent('')

    const callback = (data: MessageStream): void => {
      streamly(data)
    }

    const res = await chatGeneration({ model, content: messages, callback })
    // TODO: handle res "parentMessageId"
    // ...
    updateChatHistories(res.parentMessageId, content)

    // push(res as MessageContent)
  }, [updateChatHistories, content, model])

  useEffect(() => {
    void isOllamaServicing().then(res => {
      if (res) {
        void getInstalledModelList().then(res => {
          const current_models = [
            ...DEFAULT_MODELS,
            ...res.map(each => each.name)
          ]
          setModels(current_models)
          setModel(current_models[0])
        })
      } else {
        setModels(DEFAULT_MODELS)
        setModel(DEFAULT_MODELS[0])
      }
    })
  }, [isOllama])

  useEffect(() => {
    if (!dialogIdx) return
    // 去 fetch 這個 dialog 所有歷史的對話並且 print 出來
  }, [dialogIdx])

  const ModelSelect = useMemo(() => {
    return (
      <Select
        value={model}
        onChange={e => {
          console.log(e.target.value)
          setModel(e.target.value)
        }}
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
    )
  }, [models, model])

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
                onSubmit={e => {
                  // console.log(e.target.value)
                }}
                value={content}
                onChange={e => {
                  setContent(e.target.value)
                }}
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
          listItems={selectedNodes.map((each, index) => {
            return {
              icon: WavesIcon,
              text: each,
              onClick: () => {
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
        setSrc(res.avatar)
      })
    }
  }, [])

  return (
    <div
      className="messages-container"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}>
      <div className="avatar-container">
        <img className="avatarImg" src={src}></img>
      </div>
      <div className="messages-mezzaine">
        <div className="nickname">{role}</div>
        {/* <ReactQuill
          theme="bubble"
          value={content}
          readOnly
          placeholder={'Write something awesome...'}
          formats={formats}
          // modules={modules}
          id="quill-chatbox"
          style={{
            // border: 'blue 2px solid',
            width: '90%'
          }}
        /> */}
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