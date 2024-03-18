import './ChatBot.scss'

import GroupAddIcon from '@mui/icons-material/GroupAdd'
import VoiceChatIcon from '@mui/icons-material/VoiceChat'
import WavesIcon from '@mui/icons-material/Waves'
import { Box, Fade, Modal } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { isOllamaServicing } from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { ListComponent } from '../Common/Mui'
import ChatBotArsenal from './ChatBotArsenal'
import ChatBotMainPage from './ChatBotMainPage'

type HistoryState = {
  id: string
  text: string
  model: string
}

type HistoryListState = {
  histories: HistoryState[]
}

type HistoryListAction = {
  update: (newState: HistoryState) => void
}

const useHistoryListStore = create<HistoryListState & HistoryListAction>()(
  immer(set => ({
    histories: [],
    update: (newState: HistoryState): void =>
      set(state => {
        const indexOf = state.histories.findIndex(
          each => newState.id === each.id
        )
        if (indexOf === -1) {
          state.histories.unshift(newState)
        } else if (indexOf > 0) {
          state.histories = [newState, ...state.histories.splice(indexOf, 1)]
        }
      })
  }))
)

type ChatBotProp = {
  isShown: boolean
  closeModal: () => void
  handleClose: () => void
}

const ChatBot = ({
  isShown,
  closeModal,
  handleClose
}: ChatBotProp): React.JSX.Element => {
  const { translate } = useLanguage()

  const [tab, setTab] = useState<string>('')
  const [isOllama, setIsOllama] = useState<boolean>(false)

  const enterTab = useCallback(tab => {
    setTab(tab)
  }, [])

  const leaveTab = useCallback(() => {
    setTab('')
  }, [])

  const [chatHistory, setChatHistory] = useState<string>('')

  const histories = useHistoryListStore(state => state.histories)
  const update = useHistoryListStore(state => state.update)

  // fetch 所有的 dialogIdx, 並更新 ChatHistories
  useEffect(() => {
    void isOllamaServicing().then(res => {
      setIsOllama(res)
    })
    // fetchDialogMetadata().then((res) => {
    //   // 確認 schema -> icon = undefined, text = "title", dialog_id: "...", onClick = () => {...}
    //   setChatHistories(res)
    // })
  }, [isShown, tab])

  const RenderComponent = useMemo(() => {
    switch (tab) {
      case 'Arsenal':
        return <ChatBotArsenal isOllama={isOllama} />
      case 'Settings':
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeModal={closeModal}
            chatHistory={chatHistory}
            updateHistory={update}
          />
        )
      default:
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeModal={closeModal}
            chatHistory={chatHistory}
            updateHistory={update}
          />
        )
    }
  }, [tab])

  const handleOnClick = useCallback(
    (target: string): void => {
      if (tab == target) {
        leaveTab()
      } else {
        enterTab(target)
      }
    },
    [tab]
  )

  return (
    <Modal
      className="styled-modal"
      open={isShown}
      onClose={handleClose}
      closeAfterTransition>
      <Fade in={isShown}>
        <Box className="chatbot-modal-content">
          <div className="workspace">
            <div className="sidebar-handler">
              <ListComponent
                subtitle={'Chat'}
                listItems={histories}
                sx={{ flex: 7.5 }}
              />
              <ListComponent
                subtitle={'Flow'}
                listItems={[
                  {
                    icon: WavesIcon,
                    text: 'Arsenal',
                    onClick: () => handleOnClick('Arsenal')
                  },
                  {
                    icon: GroupAddIcon,
                    text: translate('Settings'),
                    onClick: () => handleOnClick('Settings')
                  }
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

export default ChatBot
export type { HistoryListAction, ChatBotProp, HistoryState }
