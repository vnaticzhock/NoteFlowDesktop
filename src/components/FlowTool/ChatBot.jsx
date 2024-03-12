import './ChatBot.scss'

import GroupAddIcon from '@mui/icons-material/GroupAdd'
import WavesIcon from '@mui/icons-material/Waves'
import { Box, Fade, Modal } from '@mui/material'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { fetchNode } from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { ListComponent, ListItemComponent } from '../Common/Mui'
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

  const RenderComponent = useMemo(() => {
    switch (tab) {
      case 'Arsenal':
        return <ChatBotArsenal isOllama={isOllama} />
      case 'Settings':
        return <ChatBotMainPage isOllama={isOllama} closeDialog={closeDialog} />
      default:
        return <ChatBotMainPage isOllama={isOllama} closeDialog={closeDialog} />
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
                listItems={[]}
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
