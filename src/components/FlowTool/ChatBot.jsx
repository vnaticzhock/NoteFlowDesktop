import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Modal, Box, Fade } from '@mui/material'

import { ListItemComponent, ListComponent } from '../Common/Mui'
import WavesIcon from '@mui/icons-material/Waves'
import GroupAddIcon from '@mui/icons-material/GroupAdd'

import './ChatBot.scss'
import { useLanguage } from '../../providers/i18next'

import { fetchNode } from '../../apis/APIs'
import ChatBotMainPage from './ChatBotMainPage'
import ChatBotArsenal from './ChatBotArsenal'

export default function ChatBot({ show, closeDialog, handleClose, flowId }) {
  const { translate } = useLanguage()

  const [tab, setTab] = useState(null)

  const enterTab = useCallback((tab) => {
    setTab(tab)
  }, [])

  const leaveTab = useCallback(() => {
    setTab(null)
  }, [])

  const RenderComponent = useMemo(() => {
    switch (tab) {
      case 'Arsenal':
        return <ChatBotArsenal />
      case 'Settings':
        return <ChatBotMainPage />
      default:
        return <ChatBotMainPage />
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
