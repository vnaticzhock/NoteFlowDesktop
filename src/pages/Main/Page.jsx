import React, { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import SideBar from '../../components/SideBar/SideBar.jsx'
import PageTab from '../../components/PageTab/PageTab.jsx'

const Page = () => {
  return (
    <div className="App-container">
      <SideBar />
      <div className="App-tab">
        <PageTab />
        <div className="Flow-grid">
          <Outlet />
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
