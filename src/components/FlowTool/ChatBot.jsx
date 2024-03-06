import React, { useContext, useEffect, useState } from 'react'
import {
  Modal,
  Backdrop,
  Box,
  Fade,
  Button,
  Input,
  TextField,
  Typography,
  Select,
  MenuItem,
} from '@mui/material'
import ReactQuill from 'react-quill'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import { ListItemComponent, ListComponent } from '../Common/Mui'
import WavesIcon from '@mui/icons-material/Waves'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import './ChatBot.scss'
import { useLanguage } from '../../providers/i18next'
import ollama_support from '../../assets/ollama_support'
import { chatGeneration } from '../../apis/APIs'
import { useFlowController } from '../../providers/FlowController'
import { fetchNode } from '../../apis/APIs'

export default function ChatBot({ show, closeDialog, handleClose, flowId }) {
  const { translate } = useLanguage()
  // const { user } = useApp()
  const [text, setText] = useState('')
  const [model, setModel] = useState(ollama_support[0].modelName)
  const [message, setMessage] = useState([])
  const [rerender, setRerender] = useState(false)

  const { selectedNodes } = useFlowController()

  const rer = () => {
    setRerender((prev) => !prev)
  }

  const pushBackMessage = (role, content) => {
    setMessage((prev) => [...prev, { role, content }])
  }

  const handleSubmit = () => {
    if (text === '') {
      closeDialog()
      return
    }
    pushBackMessage('user', text)
    setText('')
    chatGeneration(model, [{ role: 'user', content: text }]).then((res) => {
      console.log(res)
      pushBackMessage(res.message.role, res.message.content)
      rer()
    })
  }

  return (
    <Modal
      className="styled-modal"
      open={show}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={show}>
        <Box className="modalContent">
          <div className="workspace">
            <div className="sidebarHandler">
              <ListComponent
                subtitle={'Chat'}
                listItems={[]}
                sx={{ flex: 7.5 }}
              />
              <ListComponent
                subtitle={'Flow'}
                listItems={[
                  { icon: WavesIcon, text: 'Arsenal' },
                  { icon: GroupAddIcon, text: translate('Settings') },
                ]}
                sx={{ flex: 2.5 }}
              />
            </div>
            <div className="mainPageHandler">
              <div className="headerHandler">
                <Select
                  value={model}
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
                  {ollama_support.map((each, i) => {
                    const { modelName, manifest } = each
                    return (
                      <MenuItem key={`model-select-${i}`} value={modelName}>
                        {manifest}
                      </MenuItem>
                    )
                  })}
                </Select>
              </div>
              <div className="main">
                <div className="messageHandler">
                  <div className="messages">
                    {/* <MessageComponent /> */}
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
                              backgroundColor:
                                text == '' ? '#f0f0f0' : '#0e1111',
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
                        console.log(res)
                        pushBackMessage('system', res.content)
                      })
                    },
                  }
                })}
                sx={{ flex: 7.5, minWidth: '150px' }}
              />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

const MessageComponent = ({ role, content }) => {
  const [isHover, setIsHover] = useState(false)

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
        <img className="avatarImg" src={'http://localhost:3000/fake.png'}></img>
      </div>
      <div className="messageMezzaine">
        <div className="nickname">{role}</div>
        {/* <div className="content">{content}</div> */}
        <ReactQuill
          theme="bubble"
          value={content}
          readOnly
          placeholder={'Write something awesome...'}
        />
        <div className="tools">
          {isHover ? <ModeEditIcon sx={{ width: '20px' }} /> : <></>}
        </div>
      </div>
    </div>
  )
}
