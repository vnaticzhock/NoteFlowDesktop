import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import PageTab from '../../components/PageTab/PageTab.jsx'
import SideBar from '../../components/SideBar/SideBar.jsx'
import './Page.scss'

const Page = () => {
  const [tabList, setTabList] = useState([])
  const [activeFlowId, setActiveFlowId] = useState(-1)
  const navigateTo = useNavigate()

  const [rerender_, setRerender_] = useState(false)

  const rerender = () => {
    setRerender_((prev) => !prev)
  }

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
    let included = false
    for (let i = 0; i < tabList.length; i++) {
      if (tabList[i].id == flow.id) {
        included = true
        break
      }
    }
    if (!included) {
      setTabList((ls) => {
        ls.unshift(flow)
        return ls
      })
    }
    navigateTo(`/flow?flow_id=${flow.id}`)
  }

  // useEffect(() => {
  //   const searchParams = new URLSearchParams(location.search)
  //   const id = searchParams.get('flow_id')
  //   setActiveFlowId(id)
  // }, [location.search])

  return (
    <div className="App-container">
      <SideBar />
      <div className="App-tab">
        <PageTab
          tabList={tabList}
          setTabList={setTabList}
          toFlow={toFlow}
          activeTab={activeFlowId}
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

// const Page = () => {
//   const navigateTo = useNavigate()

//   useEffect(() => {
//     navigateTo('/login')
//   }, [])

//   return <></>
// }

export default Page
