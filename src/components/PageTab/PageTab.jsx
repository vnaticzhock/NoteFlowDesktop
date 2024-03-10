import './PageTab.scss'

import Stack from '@mui/material/Stack'
import React from 'react'
import { FaBook, FaPen } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import { createFlow } from '../../apis/APIs.jsx'
import { ButtonGroup, IconButton, Toolbar } from '../Common/Mui.jsx'
import { DeleteIcon, PlusIcon } from '../Common/ReactIcon'

export default function PageTab({
  tabList,
  setTabList,
  toFlow,
  activeTab,
  setActiveTab,
}) {
  const MaxTitleLen = 10
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
  const removeTab = (id) => {
    const indexToDelete = tabList.findIndex((tab) => tab.id === id)

    if (indexToDelete === -1) {
      console.error(`Tab with ID ${id} not found.`)
    }

    const filteredTabs = tabList.filter((tab) => tab.id !== id)
    const newActiveTabIndex = indexToDelete - 1

    setTabList(filteredTabs)

    if (newActiveTabIndex !== -1) {
      setActiveTab(filteredTabs[newActiveTabIndex].id)
      toFlow(filteredTabs[newActiveTabIndex])
    } else {
      setActiveTab(-1)
      navigate('/')
    }
  }

  return (
    <Toolbar className="toolbar" direction="row" spacing={2}>
      <Stack direction="row" spacing={1}>
        {tabList.map((tab, i) => {
          return (
            <ButtonGroup color="primary" variant="outlined" key={i}>
              <div
                className={`tab-button ${tab.id == activeTab ? 'active' : ''}`}
              >
                <div className="tab-title" onClick={() => toFlow(tab)}>
                  <p>
                    {tab.title?.length > MaxTitleLen
                      ? tab.title.substring(0, MaxTitleLen - 1) + '...'
                      : tab.title}
                  </p>
                  <icon className="tabIcon">
                    {tab.type == 'node' ? <FaBook /> : <FaPen />}
                  </icon>
                </div>

                <div className="close-button" onClick={() => removeTab(tab.id)}>
                  <DeleteIcon className="cross" size={15} />
                </div>
              </div>
            </ButtonGroup>
          )
        })}
      </Stack>
      <IconButton size="medium" onClick={addNewTab}>
        <PlusIcon color="white" size={15} />
      </IconButton>
    </Toolbar>
  )
}
