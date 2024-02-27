import React from 'react'
import { Outlet } from 'react-router-dom'
import Prelude from '../../components/TryMe/Prelude.jsx'
import './Page.scss'

const Page = () => {
  return (
    <div className="login">
      <div className="logo">
        <Prelude />
      </div>
      <Outlet />
    </div>
  )
}

export default Page
