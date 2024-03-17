import './FlowGrid.scss'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { deleteFlow, editFlowTitle, fetchFlows } from '../../apis/APIs.jsx'
import { useLanguage } from '../../providers/i18next'
import { Menu, MenuItem } from '../Common/Mui.jsx'
import RenameDialog from './RenameDialog.jsx'

export default function FlowGrid() {
  const { toFlow, editPageTab, removeTab } = useOutletContext()
  const { translate } = useLanguage()
  const [flows, setFlows] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [target, setTarget] = useState(null)
  const [targetFlow, setTargetFlow] = useState(null)
  const flowGridRef = useRef(null)


  const handleScroll = useCallback(async () => {
    const { scrollTop, scrollHeight, clientHeight } = flowGridRef.current
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      const newFlows = await fetchFlows(flows.length)
      setFlows((currentFlows) => [...currentFlows, ...newFlows])
    }
  }, [flows])

  useEffect(() => {
    const element = flowGridRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    const initFlows = async () => {
      const initialFlows = await fetchFlows(0)
      setFlows(initialFlows)
    }
    initFlows()
  }, [])

  const removeFlow = useCallback(async (flowId) => {
    await deleteFlow(flowId)
    removeTab(flowId)
    setFlows((flows) => flows.filter((flow) => flow.id !== flowId))

  }, [])

  const updateFlowTitle = useCallback(async (flowId, newTitle) => {
    setFlows((flows) => {
      const newFlows = [...flows]
      const targetFlow = newFlows.find((flow) => flow.id === flowId)
      targetFlow.title = newTitle
      return newFlows
    })

    await editFlowTitle(flowId, newTitle)
  }, [])

  const handleContextMenu = useCallback(
    (event, flow) => {
      event.preventDefault()
      event.stopPropagation()
      setTarget(event.currentTarget)
      setTargetFlow(flow)
      setMenuOpen((prev) => !prev)
    },
    [target, targetFlow, menuOpen],
  )

  return (
    <div
      className="flow-grid"
      ref={flowGridRef}
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {flows.map((flow, _) => (
        <div
          key={flow.id}
          className="flow-button"
          onClick={() => toFlow(flow)}
          onContextMenu={(event) => handleContextMenu(event, flow)}
        >
          <img src={flow.thumbnail} alt={flow.title} />
          <p>{flow.title}</p>
        </div>
      ))}
      <Menu open={menuOpen} className="flow-menu" anchorEl={target}>
        <MenuItem
          onClick={() => {
            setRenameDialogOpen(true)
            setMenuOpen(false)
          }}
        >
          {translate('Rename')}
        </MenuItem>
        <MenuItem onClick={() => removeFlow(targetFlow.id)}>
          {translate('Delete')}
        </MenuItem>
      </Menu>
      {renameDialogOpen && (
        <RenameDialog
          isVisible={renameDialogOpen}
          setIsVisible={setRenameDialogOpen}
          flow={targetFlow}
          submit={updateFlowTitle}
        />
      )}
    </div>
  )
}
