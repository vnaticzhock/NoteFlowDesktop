import './PageTab.scss'

import DeleteIcon from '@mui/icons-material/Delete'
import React from 'react'
import { FaBook, FaPen } from 'react-icons/fa'

import { PlusIcon } from '../Common/ReactIcon'

export default function PageTab({
  tabList,
  activeFlowId,
  removeTab,
  toFlow,
  addNewTab
}) {
  const MaxTitleLength = 8
  const MaxTabLength = 15

  return (
    <div className="tab-bar">
      {tabList.map((tab, i) => {
        return (
          <div
            className={`tab-button ${tab.id == activeFlowId ? 'active' : ''}`}
            key={i}>
            <div className="tab-title" onClick={() => toFlow(tab)}>
              <div className="tab-icon">
                {tab.type == 'node' ? <FaBook /> : <FaPen />}
              </div>
              <p>
                {tab.title?.length > MaxTitleLength
                  ? tab.title.substring(0, MaxTitleLength - 1) + '...'
                  : tab.title}
              </p>
            </div>

            <div className="close-button" onClick={() => removeTab(tab.id)}>
              <DeleteIcon />
            </div>
          </div>
        )
      })}
      <div
        onClick={() => {
          console.log(tabList.length)
          if (tabList.length < MaxTabLength) addNewTab()
        }}
        className="add-btn">
        <PlusIcon />
      </div>
    </div>
  )
}
