import React, { useEffect, useState } from 'react'
import './SideBar.scss'
import { FaPen, FaBook, FaCalendarAlt } from 'react-icons/fa'
import { AiTwotoneSetting } from 'react-icons/ai'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useLanguage } from '../../providers/i18next'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
  //rwd
  const { translate } = useLanguage()
  const navigateTo = useNavigate()

  const SideBarItem = styled(Box)(({ selected }) => ({
    cursor: 'pointer',
    color: selected ? 'black' : 'white',
    // color: selected ? "white" : "grey",
    width: '70%',
    height: '8px',
    marginTop: '10px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    backgroundColor: selected ? 'white' : 'black',
  }))

  const SideBarText = styled('div')(() => ({
    lineHeight: '2',
    width: '55%',
  }))

  return (
    <>
      <Stack className="sidebar">
        <a className="logo" href="/">
          <img src="assets/logo.png" alt="" width="60" height="60" />
        </a>
        <SideBarItem
          className="sidebar-item"
          onClick={() => navigateTo('/')}
          // selected={mode === 0}
        >
          <FaPen size={20} style={{ width: '45%' }} />
          <SideBarText>{translate('Flows')}</SideBarText>
        </SideBarItem>
        <SideBarItem
          className="sidebar-item"
          onClick={() => navigateTo('/library')}
          // selected={mode === 1}
        >
          <FaBook size={20} style={{ width: '45%' }} />
          <SideBarText>{translate('Library')}</SideBarText>
        </SideBarItem>
        <SideBarItem
          className="sidebar-item"
          onClick={() => navigateTo('/calendar')}
          // selected={mode === 2}
        >
          <FaCalendarAlt size={20} style={{ width: '45%' }} />
          <SideBarText>{translate('Calendar')}</SideBarText>
        </SideBarItem>
        <SideBarItem
          className="sidebar-item"
          onClick={() => navigateTo('/setting')}
          // selected={mode === 3}
        >
          <AiTwotoneSetting size={20} style={{ width: '45%' }} />
          <SideBarText>{translate('Settings')}</SideBarText>
        </SideBarItem>
      </Stack>
    </>
  )
}

export default Sidebar
