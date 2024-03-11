import './Page.scss'

import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { createFlow } from '../../apis/APIs.jsx'
import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'

const Page = () => {
  const [tabList, setTabList] = useState([])
  const [activeFlowId, setActiveFlowId] = useState(-1)
  const navigateTo = useNavigate()

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

  const navigate = useNavigate()
  const addNewTab = async () => {
    try {
      const flow = await createFlow()
      setTabList([...tabList, flow])
      toFlow(flow)
    } catch (error) {
      console.error('Error creating flow:', error)
    }
  }
  const removeTab = (flowId) => {
    const indexToDelete = tabList.findIndex((tab) => tab.id === flowId)

    if (indexToDelete === -1) {
      // not in page tab
      return
    }

    const filteredTabs = tabList.filter((tab) => tab.id !== flowId)
    const newActiveTabIndex = indexToDelete - 1

    setTabList(filteredTabs)

    if (newActiveTabIndex !== -1) {
      setActiveFlowId(filteredTabs[newActiveTabIndex].id)
      toFlow(filteredTabs[newActiveTabIndex])
    } else {
      setActiveFlowId(-1)
      navigate('/')
    }
  }

  const toFlow = (flow) => {
    if (flow.id == activeFlowId) return
    if (tabList.findIndex((each) => each.id == flow.id) == -1) {
      setTabList([...tabList, flow])
    }
    setActiveFlowId(flow.id)
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
          toFlow={toFlow}
          activeTab={activeFlowId}
          addNewTab={addNewTab}
          removeTab={removeTab}
        />
        <div className="Flow-grid">
          <Outlet
            context={{
              toFlow: toFlow,
              editPageTab: editPageTab,
              removeTab: removeTab,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Page
