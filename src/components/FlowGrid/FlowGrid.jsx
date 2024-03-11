import './FlowGrid.scss'


import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { deleteFlow, editFlowTitle, fetchFlows } from '../../apis/APIs.jsx'
import { useLanguage } from '../../providers/i18next'
import { Menu, MenuItem } from '../Common/Mui.jsx'
import LoadingScreen from '../LoadingScreen/LoadingScreen'

import RenameDialog from './RenameDialog.jsx'

export default function FlowGrid() {
  const { toFlow, editPageTab, removeTab } = useOutletContext()
  const { translate } = useLanguage()
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [MenuOpen, setMenuOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [target, setTarget] = useState(null) // the target DOM object of the right click
  const [targetFlow, setTargetFlow] = useState(null) // the flow object of the right click

  const loadingCheckPointRef = useRef(null)
  const options = {
    root: null,
    threshold: 0,
  }

  useEffect(() => {
    let page = 0
    setLoading(false)
    const observeforFetching = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const res = await fetchFlows(page)
          setFlows([
            ...flows,
            ...res.sort((a, b) =>
              a.updateAt < b.updateAt ? 1 : a.updateAt > b.updateAt ? -1 : 0,
            ),
          ])
          page += 1
        }
      })
    }, options)
    let loadingCheckPointEle = loadingCheckPointRef.current
    if (loadingCheckPointEle) observeforFetching.observe(loadingCheckPointEle)

    return () => {
      let loadingCheckPointEle = loadingCheckPointRef.current
      if (loadingCheckPointEle) {
        observeforFetching.unobserve(loadingCheckPointEle)
      }
    }
  }, [loading])

  const removeFlow = async (flowId) => {
    await deleteFlow(flowId)
    removeTab(flowId)
    setFlows((data) => data.filter((each) => each.id != flowId))
  }

  const renameFlow = async (flow) => {
    await editFlowTitle(flow.id, flow.title)
    editPageTab(flow.id, flow.title)
    const at = flows.findIndex((f) => f.id === flow.id)
    setFlows((prev) => {
      prev[at].title = flow.title
      return prev
    })
    setTargetFlow(null)
  }

  const handleDelete = async (flow) => {
    await removeFlow(flow.id)
    setMenuOpen(false)
    setTargetFlow(null)
  }

  const handleRename = () => {
    setRenameDialogOpen(true)
    setMenuOpen(false)
  }

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="flow-grid">
      <div className="flow-container">
        {flows.map((flow, i) => {
          return (
            <div
              key={i}
              className="flow-button"
              onClick={() => {
                toFlow(flow)
              }}
              onContextMenu={(event) => {
                console.log('right click', flow.id)
                event.preventDefault()
                event.stopPropagation()
                setTarget(event.currentTarget)
                setTargetFlow(flow)
                setMenuOpen((prev) => !prev)
              }}
            >
              <img src={flow.thumbnail} loading="lazy" />
              <p>{flow.title}</p>

              <Menu open={MenuOpen} className="flow-menu" anchorEl={target}>
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRename(targetFlow)
                  }}
                >
                  {translate('Rename')}
                </MenuItem>
                <MenuItem
                  onClick={async (event) => {
                    event.stopPropagation()
                    handleDelete(targetFlow)
                    console.log('delete', targetFlow.id)
                  }}
                >
                  {translate('Delete')}
                </MenuItem>
              </Menu>

              <RenameDialog
                isVisible={renameDialogOpen}
                setIsVisible={setRenameDialogOpen}
                flow={targetFlow}
                submit={renameFlow}
              />
            </div>
          )
        })}
        <div className="loading-checkpoint" ref={loadingCheckPointRef}>
          {/* CHECKPOINT */}
        </div>
      </div>
    </div>
  )
}
