import './ChatBot.scss'

import GroupAddIcon from '@mui/icons-material/GroupAdd'
import VoiceChatIcon from '@mui/icons-material/VoiceChat'
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

  const enterTab = useCallback(tab => {
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
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeModal={closeModal}
            chatHistory={chatHistory}
            updateHistory={update}
            insertHistory={insert}
            setHistory={setChatHistory}
            newMessages={newMessages}
          />
        )
      default:
        return (
          <ChatBotMainPage
            isOllama={isOllama}
            closeModal={closeModal}
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
      if (tab == target) {
        leaveTab()
      } else {
        enterTab(target)
      }
    },
    [tab]
  )

  const ChatHistoryList = useMemo(() => {
    const IconMapper = {
      'GPT-3.5': () => <ChatGPTIcon />,
      'GPT-4': () => <ChatGPTIcon />
    }
    console.log(histories)
    return histories.map(each => {
      return {
        icon: IconMapper[each.model],
        text: each.name,
        onClick: () => setChatHistory(each)
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
                listItems={ChatHistoryList}
                sx={{
                  flex: 7.5,
                  // border: 'blue 2px solid',
                  maxHeight: '60vh',
                  overflow: 'auto'
                }}
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
