import React, { useEffect, useState } from 'react'
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ListItemComponent, ListComponent } from '../Common/Mui'
import WavesIcon from '@mui/icons-material/Waves'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import './ChatBot.scss'
// import instance from '../../API/api'
import { useLanguage } from '../../providers/i18next'
// import { useApp } from '../../hooks/useApp'

export default function ChatBot({ show, closeDialog, handleClose, flowId }) {
  const { translate } = useLanguage()
  // const { user } = useApp()
  const [text, setText] = useState('')
  const [model, setModel] = useState('ChatGPT 4')

  const handleSubmit = () => {
    closeDialog()
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
                  { icon: WavesIcon, text: 'Depository' },
                  { icon: GroupAddIcon, text: translate('Settings') },
                ]}
                sx={{ flex: 2.5 }}
              />
            </div>
            <div className="mainPageHandler">
              <div className="headerHandler">
                <Select
                  placeholder="ChatGPT 4"
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
                  <MenuItem value={'ChatGPT 4'}>ChatGPT 4</MenuItem>
                  <MenuItem value={'llama'}>Llama</MenuItem>
                  <MenuItem value={'Mixtral'}>Mixtral</MenuItem>
                </Select>
              </div>
              <div className="main">
                <div className="messageHandler">
                  <div className="messages"></div>
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
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}
