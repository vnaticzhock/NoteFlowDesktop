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

const Sidebar = () => {
  const { translate } = useLanguage()

  return (
    <Stack className="sidebar">
      <a className="logo" href="/">
        <img src="assets/logo.png" alt="" width="60" height="60" />
      </a>
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          to={path}
          key={label}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'selected' : ''}`
          }
          style={{ textDecoration: 'none' }}
        >
          <Icon size={20} style={{ width: '45%' }} />
          <div className="sidebar-text">{translate(label)}</div>
        </NavLink>
      ))}
    </Stack>
  )
}

export default Sidebar
