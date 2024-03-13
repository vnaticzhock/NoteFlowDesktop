import './ChatBotMainPage.scss'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import WavesIcon from '@mui/icons-material/Waves'
import { Button, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill'

import {
  chatGeneration,
  DEFAULT_MODELS,
  fetchNode,
  getChatGPTDefaultApiKey,
  getInstalledModelList,
  getPhoto,
} from '../../apis/APIs'
import ollama_support from '../../assets/ollama_support'
import { useFlowController } from '../../providers/FlowController'
import { ListComponent, ListItemComponent } from '../Common/Mui'
import EditorToolbar, { formats } from '../Editor/EditorToolbar'

const ChatBotMainPage = ({ isOllama, closeDialog }) => {
  // 選擇適當的模型
  const [model, setModel] = useState('')
  const [models, setModels] = useState([])

  const apiKey = useRef('')

  const [text, setText] = useState('')
  const [message, setMessage] = useState([])

  const { selectedNodes } = useFlowController()

  const pushBackMessage = (role, content) => {
    setMessage((prev) => [...prev, { role, content }])
  }

  const handleSubmit = async () => {
    // 送出訊息，推送訊息到大型語言模型及訊息列中
    const message = text
    if (text === '') {
      closeDialog()
      return
    }
    pushBackMessage('user', text)
    setText('')

    const res = await chatGeneration(model, message)

    console.log(res)
    pushBackMessage(res.role, res.text)
  }

  useEffect(() => {
    if (isOllama) {
      getInstalledModelList().then((res) => {
        const current_models = [
          ...DEFAULT_MODELS,
          ...res.map((each) => each.name),
        ]
        setModels(current_models)
        setModel(current_models[0])
      })
    } else {
      setModels(DEFAULT_MODELS)
      setModel(DEFAULT_MODELS[0])
    }
  }, [isOllama])

  const ModelSelect = useMemo(() => {
    return (
      <Select
        value={models.length === 0 ? '' : models[0]}
        onChange={(e) => setModel(e.target.value)}
        sx={{
          fontWeight: 550,
          '.MuiOutlinedInput-notchedOutline': {
            // borderColor: 'rgba(228, 219, 233, 0.25)',
            border: 'none',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(228, 219, 233, 0.25)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(228, 219, 233, 0.25)',
          },
        }}
        IconComponent={() => <KeyboardArrowDownIcon />}
      >
        {models.map((name, i) => {
          return (
            <MenuItem key={`model-select-${i}`} value={name}>
              {name}
            </MenuItem>
          )
        })}
      </Select>
    )
  }, [models])

  return (
    <div className="chatbot-window">
      <div className="mainpage-handler">
        <div className="header-handler">{ModelSelect}</div>
        <div className="main">
          <div className="message-handler">
            <div className="messages">
              {message.map((each, i) => {
                const { role, content } = each
                return (
                  <MessageComponent
                    key={`message-component-${i}`}
                    role={role}
                    content={content}
                  />
                )
              })}
            </div>
            <div className="input-bar">
              <TextField
                onSubmit={(e) => {
                  console.log(e.target.value)
                }}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                }}
                placeholder="發送訊息給 Chatbot"
                InputProps={{
                  sx: { borderRadius: '20px' },
                  endAdornment: (
                    <Button
                      onClick={handleSubmit}
                      style={{
                        backgroundColor: text == '' ? '#f0f0f0' : '#0e1111',
                        color: 'white',
                      }}
                    >
                      <ArrowUpwardIcon />
                    </Button>
                  ),
                }}
                sx={{
                  width: '100%',
                  '& label.Mui-focused': {
                    color: '#f0f0f0',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottomColor: '#f0f0f0',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#f0f0f0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#f0f0f0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f0f0f0',
                    },
                  },
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
                fetchNode(each).then((res) => {
                  if (!res) return
                  pushBackMessage('system', res.content)
                })
              },
            }
          })}
          sx={{ flex: 7.5, minWidth: '150px' }}
        />
      </div>
    </div>
  )
}

const MessageComponent = ({ role, content }) => {
  const [isHover, setIsHover] = useState(false)

  const [src, setSrc] = useState('http://localhost:3000/fake.png')

  useEffect(() => {
    if (role === 'user') {
      getPhoto().then((res) => {
        setSrc(res.avatar)
      })
    }
  }, [])

  return (
    <div
      className="message-container"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="avatar-container">
        <img className="avatarImg" src={src}></img>
      </div>
      <div className="message-mezzaine">
        <div className="nickname">{role}</div>
        <ReactQuill
          theme="bubble"
          value={content}
          readOnly
          placeholder={'Write something awesome...'}
          formats={formats}
          // modules={modules}
          id="quill-chatbox"
          style={{
            // border: 'blue 2px solid',
            width: '90%',
          }}
        />
        <div className="tools">
          {isHover ? <ModeEditIcon sx={{ width: '20px' }} /> : <></>}
        </div>
      </div>
    </div>
  )
}

export default ChatBotMainPage
