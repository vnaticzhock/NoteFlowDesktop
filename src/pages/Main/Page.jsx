import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'
import './Page.scss'

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

  const toFlow = (flow) => {
    if (flow.id == activeFlowId) return
    if (!tabList.find((tab) => tab.id == flow.id)) {
      setTabList((prev) => {
        return [...prev, flow]
      })
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
          toFlow={toFlow}
          activeTab={activeFlowId}
          setActiveTab={setActiveFlowId}
        />
        <div className="Flow-grid">
          <Outlet
            context={{
              toFlow: toFlow,
              activeFlowId: activeFlowId,
              editPageTab: editPageTab,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Page
