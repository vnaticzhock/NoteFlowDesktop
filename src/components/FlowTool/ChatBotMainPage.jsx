import './ChatBotMainPage.scss'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import WavesIcon from '@mui/icons-material/Waves'
import { Button, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import ReactQuill from 'react-quill'

import {
  chatGeneration,
  fetchNode,
  getInstalledModelList,
  getPhoto,
} from '../../apis/APIs'
import ollama_support from '../../assets/ollama_support'
import { useFlowController } from '../../providers/FlowController'
import { ListComponent, ListItemComponent } from '../Common/Mui'
import EditorToolbar, { formats } from '../Editor/EditorToolbar'

const ChatBotMainPage = ({ closeDialog }) => {
  const [model, setModel] = useState('')
  const [models, setModels] = useState([])

  const [text, setText] = useState('')
  const [message, setMessage] = useState([])
  // const [rerender, setRerender] = useState(false)

  const { selectedNodes } = useFlowController()

  // const rer = () => {
  //   setRerender((prev) => !prev)
  // }

  const pushBackMessage = (role, content) => {
    setMessage((prev) => [...prev, { role, content }])
  }

  const handleSubmit = async () => {
    const message = text
    if (text === '') {
      closeDialog()
      return
    }
    pushBackMessage('user', text)
    setText('')
    console.log(model)
    const res = await chatGeneration(model, [
      { role: 'user', content: message },
    ])
    console.log(res)
    pushBackMessage(res.message.role, res.message.content)
    // rer()
  }

  useEffect(() => {
    getInstalledModelList().then((res) => {
      setModels(res.map((each) => each.name))
      setModel(res[0].name)
    })
  }, [])

  const ModelSelect = useMemo(() => {
    return (
      <Select
        value={models.length === 0 ? '' : models[0]}
        onChange={(e) => setModel(e.target.value)}
        sx={{
          fontWeight: 550,
          border: 'none',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
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
    <div className="chatBotWindow">
      <div className="mainPageHandler">
        <div className="headerHandler">{ModelSelect}</div>
        <div className="main">
          <div className="messageHandler">
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
            <div className="inputBar">
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
                  // startAdornment: (
                  //   <Button
                  //     onClick={() => {}}
                  //     style={{
                  //       color: 'black',
                  //       maxWidth: '15px',
                  //       // border: 'red 2px solid',
                  //     }}
                  //   >
                  //     <BlurOnIcon />
                  //   </Button>
                  // ),
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
      className="messageContainer"
      onMouseEnter={() => {
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      <div className="avatarContainer">
        <img className="avatarImg" src={src}></img>
      </div>
      <div
        className="messageMezzaine"
        style={
          {
            // border: 'red 2px solid',
          }
        }
      >
        <div className="nickname">{role}</div>
        {/* <div className="content">{content}</div> */}
        <ReactQuill
          theme="bubble"
          value={content}
          readOnly
          placeholder={'Write something awesome...'}
          formats={formats}
          // modules={modules}
          id="quill-chatbox"
          style={{
            border: 'blue 2px solid',
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
