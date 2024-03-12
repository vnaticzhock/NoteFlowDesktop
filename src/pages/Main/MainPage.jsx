import './MainPage.scss'

import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'

const Page = () => {
  const navigateTo = useNavigate()
  const [tabList, setTabList] = useState([])
  const [activeFlowId, setActiveFlowId] = useState(-1)

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

  const removeTab = (flowId) => {
    const flowIdToDelete = tabList.findIndex((tab) => tab.id === flowId)
    if (flowIdToDelete === -1) {
      return
    }

    const filteredTabs = tabList.filter((tab) => tab.id !== flowId)
    setTabList(filteredTabs)

    if (filteredTabs.length === 0) {
      setActiveFlowId(-1)
      navigateTo('/')
      return
    }

    if (flowIdToDelete === activeFlowId) {
      let newActiveTabIndex
      if (flowIdToDelete === 0) {
        newActiveTabIndex = tabList.length - 1
      } else {
        newActiveTabIndex = flowIdToDelete - 1
      }
      navigateTo(`/flow?flow_id=${tabList[newActiveTabIndex].id}`)
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
      </div>
    </div>
  )
}

export default Page
