import './ChatBot.scss'

import SettingsIcon from '@mui/icons-material/Settings'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LogoutIcon from '@mui/icons-material/Logout'
import WavesIcon from '@mui/icons-material/Waves'
import { Box, Fade, Modal } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
  fetchHistories,
  isOllamaServicing,
  updateHistory
} from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { ListComponent } from '../Common/Mui'
import ChatBotArsenal from './ChatBotArsenal'
import ChatBotMainPage from './ChatBotMainPage'
import ChatBotSettings from './ChatBotSettings'
import { HistoryState, NewMessageState } from '../../types/extendWindow/chat'
import ChatGPTIcon from '../Common/ChatGPTIcon'

type HistoryListState = {
  histories: HistoryState[]
}

type HistoryListAction = {
  update: (newState: HistoryState) => void
  initialize: (newStates: HistoryState[]) => void
  insert: (newState: NewMessageState) => void
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
          // void insertNewHistory(newState.id, newState.name, newState.model)
        } else if (indexOf > 0) {
          state.histories = [newState, ...state.histories.splice(indexOf, 1)]
        }
        void updateHistory(newState.id, newState.parentMessageId, newState.name)
      }),
    insert: (newState: HistoryState): void =>
      set(state => {
        state.histories.unshift(newState)
      }),
    initialize: (newStates: HistoryState[]): void =>
      set(state => {
        state.histories = newStates
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

  const enterTab = useCallback((tab: string) => {
    setTab(tab)
  }, [])

  const leaveTab = useCallback(() => {
    setTab('')
  }, [])

  const [chatHistory, setChatHistory] = useState<HistoryState | null>(null)

  const histories = useHistoryListStore(state => state.histories)
  const insert = useHistoryListStore(state => state.insert)
  const update = useHistoryListStore(state => state.update)
  const initialize = useHistoryListStore(state => state.initialize)

  const newMessages = useCallback(() => {
    enterTab('')
    setChatHistory(null)
  }, [chatHistory, setChatHistory])

  // fetch 所有的 dialogIdx, 並更新 ChatHistories
  useEffect(() => {
    void isOllamaServicing().then(setIsOllama)
    if (tab === '') {
      void fetchHistories().then(initialize)
    }
  }, [isShown, tab])

  const RenderComponent = useMemo(() => {
    switch (tab) {
      case 'Arsenal':
        return <ChatBotArsenal isOllama={isOllama} />
      case 'Settings':
        return <ChatBotSettings />
      default:
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            chatHistory={chatHistory}
            updateHistory={update}
            insertHistory={insert}
            setHistory={setChatHistory}
            newMessages={newMessages}
          />
        )
    }
  }, [tab, chatHistory])

  const handleOnClick = useCallback(
    (target: string): void => {
      // 有特殊效用
      setChatHistory(null)
      if (tab == target) {
        leaveTab()
      } else {
        enterTab(target)
      }
    },
    [tab]
  )

  const ChatHistoryList = useMemo(() => {
    return histories.map((each, index) => {
      const { model, name } = each
      const icon = model.startsWith('GPT') ? ChatGPTIcon : ChatGPTIcon
      return {
        icon: icon,
        text: name,
        id: `message-${index}`,
        onClick: () => {
          setChatHistory(each)
          // leaveTab()
          enterTab(`message-${index}`)
        }
      }
    })
  }, [histories])

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
                selected={tab}
                listItems={ChatHistoryList}
                sx={{
                  flex: 7.5,
                  maxHeight: '60vh',
                  overflow: 'auto'
                }}
              />
              <ListComponent
                subtitle={'Settings'}
                selected={tab}
                listItems={[
                  {
                    icon: ListAltIcon,
                    id: 'Arsenal',
                    text: 'Models',
                    onClick: () => handleOnClick('Arsenal')
                  },
                  {
                    icon: SettingsIcon,
                    id: 'Settings',
                    text: translate('Parameters'),
                    onClick: () => handleOnClick('Settings')
                  },
                  {
                    icon: LogoutIcon,
                    text: 'Close',
                    onClick: (): void => {
                      closeModal()
                      setChatHistory(null)
                    }
                  }
                ]}
                sx={{ justifySelf: 'flex-end' }}
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
