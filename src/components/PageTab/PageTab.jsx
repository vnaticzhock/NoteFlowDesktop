import './PageTab.scss'

import Stack from '@mui/material/Stack'
import React from 'react'
import { FaBook, FaPen } from 'react-icons/fa'

import { ButtonGroup, IconButton, Toolbar } from '../Common/Mui.jsx'
import { DeleteIcon, PlusIcon } from '../Common/ReactIcon'

export default function PageTab({
  tabList,
  toFlow,
  activeTab,
  addNewTab,
  removeTab,
}) {
  const MaxTitleLen = 10

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
                  <div className="tabIcon">
                    {tab.type == 'node' ? <FaBook /> : <FaPen />}
                  </div>
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
