import './PageTab.scss'

import DeleteIcon from '@mui/icons-material/Delete'
import React from 'react'
import { FaPen } from 'react-icons/fa'
import { IFlow } from '../../types/flow/flow'
import { PlusIcon } from '../Common/ReactIcon'

type PageTabProps = {
  tabList: IFlow[]
  activeFlowId: string
  removeTab: (id: string) => void
  toFlow: (flow: IFlow) => void
  addNewTab: () => void
}

export default function PageTab({
  tabList,
  activeFlowId,
  removeTab,
  toFlow,
  addNewTab
}: PageTabProps) {
  const MaxTitleLength = 8 as const
  const MaxTabLength = 15 as const

  return (
    <div className="tab-bar">
      {tabList.map((tab: IFlow, i: number) => {
        return (
          <div
            className={`tab-button ${tab.id == activeFlowId ? 'active' : ''}`}
            key={i}>
            <div className="tab-title" onClick={() => toFlow(tab)}>
              <div className="tab-icon">
                {/* {tab.type == 'node' ? <FaBook /> : <FaPen />} */}
                <FaPen />
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
