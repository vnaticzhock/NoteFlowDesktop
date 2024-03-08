import Stack from '@mui/material/Stack'
import React from 'react'
import { FaBook, FaPen } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { createFlow } from '../../apis/APIs.jsx'
import { ButtonGroup, IconButton, Toolbar } from '../Common/Mui.jsx'
import { DeleteIcon, PlusIcon } from '../Common/ReactIcon'
import './PageTab.scss'

export default function PageTab({ tabList, setTabList, toFlow, activeTab }) {
  const MaxTitleLen = 10
  const navigate = useNavigate()

  const backToHome = () => navigate('/')
  const addNewFlow = async () => {
    try {
      const flow = await createFlow()
      setTabList([...tabList, flow])
    } catch (error) {
      console.error('Error creating flow:', error)
    }
  }
  const removeTab = (id) => {
    setTabList((tabs) => {
      return tabs.filter((tab) => tab.id !== id)
    })
    backToHome()
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
      <IconButton size="medium" onClick={addNewFlow}>
        <PlusIcon color="white" size={15} />
      </IconButton>
    </Toolbar>
  )
}
