import './ChatBot.scss'

import GroupAddIcon from '@mui/icons-material/GroupAdd'
import WavesIcon from '@mui/icons-material/Waves'
import { Box, Fade, Modal } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchNode } from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { ListComponent } from '../Common/Mui'
import ChatBotArsenal from './ChatBotArsenal'
import ChatBotMainPage from './ChatBotMainPage'

export default function ChatBot({ show, closeDialog, handleClose, flowId }) {
  const { translate } = useLanguage()
  const [tab, setTab] = useState(null)
  const [isOllama, setIsOllama] = useState(false)

  const enterTab = useCallback((tab) => {
    setTab(tab)
  }, [])

  const leaveTab = useCallback(() => {
    setTab(null)
  }, [])

  const [chatHistories, setChatHistories] = useState([])
  const [dialogIdx, setDialogIdx] = useState(null)

  const updateChatHistories = useCallback((dialogIdx, messages) => {
    // if 沒見過這個 histories
    // push to top, 叫 ollama 下標題; 或是直接設置 message 的前幾個字
    // else: 見過這個 histories
    // swap to top
  }, [])

  // fetch 所有的 dialogIdx, 並更新 ChatHistories
  useEffect(() => {
    // fetchDialogMetadata().then((res) => {
    //   // 確認 schema -> icon = undefined, text = "title", dialog_id: "...", onClick = () => {...}
    //   setChatHistories(res)
    // })
  }, [])

  const RenderComponent = useMemo(() => {
    switch (tab) {
      case 'Arsenal':
        return <ChatBotArsenal isOllama={isOllama} />
      case 'Settings':
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeDialog={closeDialog}
            dialogIdx={dialogIdx}
          />
        )
      default:
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeDialog={closeDialog}
            dialogIdx={dialogIdx}
          />
        )
    }
  }, [tab])

  return (
    <Modal
      className="styled-modal"
      open={show}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={show}>
        <Box className="chatbot-modal-content">
          <div className="workspace">
            <div className="sidebar-handler">
              <ListComponent
                subtitle={'Chat'}
                listItems={chatHistories}
                sx={{ flex: 7.5 }}
              />
              <ListComponent
                subtitle={'Flow'}
                listItems={[
                  {
                    icon: WavesIcon,
                    text: 'Arsenal',
                    onClick: () => {
                      if (tab == 'Arsenal') {
                        leaveTab()
                      } else {
                        enterTab('Arsenal')
                      }
                    },
                  },
                  {
                    icon: GroupAddIcon,
                    text: translate('Settings'),
                    onClick: () => {
                      if (tab == 'Settings') {
                        leaveTab()
                      } else {
                        enterTab('Settings')
                      }
                    },
                  },
                ]}
                sx={{ flex: 2.5 }}
              />
            </div>
            {RenderComponent}
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

// ) : (
//   // 必須要把 Box 放在這，否則就要處理 forwardRef 的問題，才可以重新開一個 Component
//   <Box className="chatbot-uninstall-box">
//     <img
//       className="ollama-img"
//       src="http://localhost:3000/ollama.png"
//     ></img>
//     <div className="bulletin">We use Ollama as our engine</div>
//   </Box>
// )}
