import Stack from '@mui/material/Stack'
import React from 'react'
import { AiTwotoneSetting } from 'react-icons/ai'
import { FaBook, FaCalendarAlt, FaPen } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../providers/i18next'
import './SideBar.scss'

const navItems = [
  { icon: FaPen, label: 'Flows', path: '/' },
  { icon: FaBook, label: 'Library', path: '/library' },
  { icon: FaCalendarAlt, label: 'Calendar', path: '/calendar' },
  { icon: AiTwotoneSetting, label: 'Settings', path: '/setting' },
]

// NavLink has an isActive dynamic prop that can be used to style the active link

const Sidebar = () => {
  const { translate } = useLanguage()

  return (
    <Stack className="sidebar">
      <NavLink className="logo" to="/">
        <img src="assets/logo.png" alt="" />
      </NavLink>
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          to={path}
          key={label}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'selected' : ''}`
          }
        >
          <Icon size={20} style={{ width: '45%' }} />
          <div className="sidebar-text">{translate(label)}</div>
        </NavLink>
      ))}
    </Stack>
  )
}

export default Sidebar
