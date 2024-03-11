import './PageTab.scss'

import DeleteIcon from '@mui/icons-material/Delete'
import React from 'react'
import { FaBook, FaPen } from 'react-icons/fa'

import { PlusIcon } from '../Common/ReactIcon'

export default function PageTab({
  tabList,
  toFlow,
  activeTab,
  addNewTab,
  removeTab,
}) {
  const MaxTitleLen = 10
  const MaxTabLength = 15

  return (
    <div className="tab-bar">
      {tabList.map((tab, i) => {
        return (
          // <ButtonGroup color="primary" variant="outlined" key={i}>
          <div
            className={`tab-button ${tab.id == activeTab ? 'active' : ''}`}
            key={i}
          >
            <div className="tab-title" onClick={() => toFlow(tab)}>
              <div className="tab-icon">
                {tab.type == 'node' ? <FaBook /> : <FaPen />}
              </div>
              <p>
                {tab.title?.length > MaxTitleLen
                  ? tab.title.substring(0, MaxTitleLen - 1) + '...'
                  : tab.title}
              </p>
            </div>

            <div className="close-button" onClick={() => removeTab(tab.id)}>
              <DeleteIcon />
            </div>
          </div>
          // </ButtonGroup>
        )
      })}
      <div
        onClick={() => {
          console.log(tabList.length)
          if (tabList.length < MaxTabLength) addNewTab()
        }}
        className="add-btn"
      >
        <PlusIcon />
      </div>
    </div>
  )
}
