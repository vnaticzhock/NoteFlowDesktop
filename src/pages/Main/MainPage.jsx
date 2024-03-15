import './MainPage.scss'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey'
import KeyboardControlKeyIcon from '@mui/icons-material/KeyboardControlKey'
import KeyboardOptionKeyIcon from '@mui/icons-material/KeyboardOptionKey'
import React, { Fragment, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { createFlow } from '../../apis/APIs.jsx'
import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'
import useKeyBoard from '../../hooks/useKeyBoard.jsx'
const Page = () => {
  const navigateTo = useNavigate()
  const [keys, setKeys] = useState([])
  const [keyboardShowing, setKeyboardShowing] = useState(false)
  const [tabList, setTabList] = useState([])
  const [activeFlowId, setActiveFlowId] = useState(-1)

  const onKeyPress = async (pressed) => {
    // Meta key handles page navigation and tab management
    // Meta + 1, 2, 3, 4: switch to the first, second, third, or fourth tab
    // Meta + ArrowRight: switch to the next tab
    // Meta + ArrowLeft: switch to the previous tab
    // Meta + n: create a new tab
    // Meta + d: delete the current tab
    // Meta + f: navigate to the flow page
    // Meta + l: navigate to the library page
    // Meta + c: navigate to the calendar page
    // Meta + s: navigate to the setting page
    if (pressed.includes('Meta')) {
      if (pressed.includes('1') && tabList.length > 0) {
        toFlow(tabList[0])
      } else if (pressed.includes('2') && tabList.length > 1) {
        toFlow(tabList[1])
      } else if (pressed.includes('3') && tabList.length > 2) {
        toFlow(tabList[2])
      } else if (pressed.includes('4') && tabList.length > 3) {
        toFlow(tabList[3])
      } else if (pressed.includes('ArrowRight') && activeFlowId !== -1) {
        const activeTabIndex = tabList.findIndex(
          (tab) => tab.id === activeFlowId,
        )
        const newActiveTabIndex = (activeTabIndex + 1) % tabList.length
        navigateTo(`/flow?flow_id=${tabList[newActiveTabIndex].id}`)
      } else if (pressed.includes('ArrowLeft') && activeFlowId !== -1) {
        const activeTabIndex = tabList.findIndex(
          (tab) => tab.id === activeFlowId,
        )
        const newActiveTabIndex =
          activeTabIndex === 0 ? tabList.length - 1 : activeTabIndex - 1
        navigateTo(`/flow?flow_id=${tabList[newActiveTabIndex].id}`)
      } else if (pressed.includes('n')) {
        await addNewTab()
      } else if (pressed.includes('d')) {
        removeTab(activeFlowId)
      } else if (pressed.includes('f')) {
        navigateTo('/')
      } else if (pressed.includes('l')) {
        navigateTo('/library')
      } else if (pressed.includes('c')) {
        navigateTo('/calendar')
      } else if (pressed.includes('s')) {
        navigateTo('/setting')
      }
    }
  }

  useKeyBoard(onKeyPress, keys, setKeys)

  useEffect(() => {
    keys.length > 0 ? setKeyboardShowing(true) : setKeyboardShowing(false)
  }, [keys])

  const editPageTab = (id, title) => {
    setTabList((prev) => {
      return prev.map((each) => {
        if (each.id == id) {
          each.title = title
        }
        return each
      })
    })
  }

  const addNewTab = async () => {
    try {
      const flow = await createFlow()
      setTabList([...tabList, flow])
      navigateTo(`/flow?flow_id=${flow.id}`)
    } catch (error) {
      console.error('Error creating flow:', error)
    }
  }

  const removeTab = (flowId) => {
    const flowToDelete = tabList.find((tab) => tab.id === flowId)
    if (!flowToDelete) {
      return
    }

    const flowIdToDelete = flowToDelete.id
    const filteredTabs = tabList.filter((tab) => tab.id !== flowId)
    const flowToDeleteIndex = tabList.findIndex(
      (tab) => tab.id === flowIdToDelete,
    )

    setTabList(filteredTabs)

    if (filteredTabs.length === 0) {
      setActiveFlowId(-1)
      navigateTo('/')
      return
    }

    if (flowIdToDelete === activeFlowId) {
      const newActiveTabIndex =
        flowToDeleteIndex === 0
          ? filteredTabs.length - 1
          : flowToDeleteIndex - 1
      navigateTo(`/flow?flow_id=${filteredTabs[newActiveTabIndex].id}`)
    }
  }

  const toFlow = (flow) => {
    if (flow.id == activeFlowId) return
    if (tabList.findIndex((each) => each.id == flow.id) == -1) {
      setTabList([...tabList, flow])
    }
    navigateTo(`/flow?flow_id=${flow.id}`)
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const id = parseInt(searchParams.get('flow_id')) ?? -1
    setActiveFlowId(id)
  }, [location.search])

  return (
    <div className="App-container">
      {location.pathname !== '/flow' ? <SideBar /> : <></>}
      <div className="App-tab">
        <PageTab
          tabList={tabList}
          setTabList={setTabList}
          activeFlowId={activeFlowId}
          removeTab={removeTab}
          addNewTab={addNewTab}
          toFlow={toFlow}
        />
        <div className="Flow-grid">
          <Outlet
            context={{
              toFlow: toFlow,
              editPageTab: editPageTab,
              removeTab: removeTab,
              activeFlowId: activeFlowId,
            }}
          />
        </div>
        {keyboardShowing && (
          <div className="keyboard">
            {keys.map((key, index) => (
              <Fragment key={index}>
                <div className="key">
                  {key === 'Meta' ? (
                    <KeyboardCommandKeyIcon fontSize="inherit" />
                  ) : key === 'Control' ? (
                    <KeyboardControlKeyIcon fontSize="inherit" />
                  ) : key === 'Alt' ? (
                    <KeyboardOptionKeyIcon fontSize="inherit" />
                  ) : key === 'ArrowRight' ? (
                    <KeyboardArrowRightIcon fontSize="inherit" />
                  ) : key === 'ArrowLeft' ? (
                    <KeyboardArrowLeftIcon fontSize="inherit" />
                  ) : (
                    key
                  )}
                </div>
                {index < keys.length - 1 && <div className="plus">+</div>}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
