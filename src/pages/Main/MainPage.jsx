import './MainPage.scss'

import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { createFlow } from '../../apis/APIs.jsx'
import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'
import useKeyBoard from '../../hooks/useKeyBoard.jsx'

const Page = () => {
  const navigateTo = useNavigate()
  const [keys, setKeys] = useState([])
  const [tabList, setTabList] = useState([])
  const [activeFlowId, setActiveFlowId] = useState(-1)

  const onKeyPress = async (pressed) => {
    console.log(pressed)
    if (pressed.includes('Meta') && pressed.includes('n')) {
      await addNewTab()
    }
    if (pressed.includes('Meta') && pressed.includes('d')) {
      removeTab(activeFlowId)
    }
  }

  useKeyBoard(onKeyPress, keys, setKeys)

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
    const id = searchParams.get('flow_id')
    setActiveFlowId(parseInt(id))
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
        <div className="keyboard">
          {keys.map((key, index) => (
            <div key={index} className="key">
              {index < keys.length - 1 ? `${key} + ` : key}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page
