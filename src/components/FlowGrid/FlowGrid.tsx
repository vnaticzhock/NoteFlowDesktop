import './FlowGrid.scss'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { deleteFlow, editFlowTitle, fetchFlows } from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { IFlow } from '../../types/flow/flow'
import { Menu, MenuItem } from '../Common/Mui.jsx'
import RenameDialog from './RenameDialog'

export type OutletContent = {
  toFlow: (flow: IFlow) => void
  removeTab: (flowId: string) => void
  editPageTab: (flowId: string, newTitle: string) => void
  activeFlowId: string
}

export default function FlowGrid(): JSX.Element {
  const { toFlow, removeTab } = useOutletContext<OutletContent>()
  const { translate } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [flows, setFlows] = useState<IFlow[]>([])
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [targetFlow, setTargetFlow] = useState<IFlow | null>(null)
  const flowGridRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(async () => {
    if (flowGridRef.current === null) return
    const { scrollTop, scrollHeight, clientHeight } = flowGridRef.current
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      const newFlows = await fetchFlows(flows.length)
      setFlows(currentFlows => [...currentFlows, ...newFlows])
    }
  }, [flows])

  useEffect(() => {
    const element = flowGridRef.current
    if (element !== null) {
      element.addEventListener('scroll', handleScroll)
      return () => {
        element.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    const initFlows = async (): Promise<void> => {
      const initialFlows: IFlow[] = await fetchFlows(0)
      setFlows(initialFlows)
    }
    void initFlows()
  }, [])

  const removeFlow = useCallback(async (flowId: string): Promise<void> => {
    await deleteFlow(flowId)
    removeTab(flowId)
    setFlows(flows => flows.filter(flow => flow.id !== flowId))
  }, [])

  const updateFlowTitle = useCallback(
    async (flowId: string, newTitle: string) => {
      setFlows(flows => {
        const newFlows = [...flows]
        const targetFlow = newFlows.find(flow => flow.id === flowId)
        if (targetFlow !== undefined) targetFlow.title = newTitle
        return newFlows
      })

      await editFlowTitle(flowId, newTitle)
    },
    []
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, flow: IFlow) => {
      event.preventDefault()
      event.stopPropagation()
      setTarget(event.currentTarget as HTMLElement)
      setTargetFlow(flow)
      setMenuOpen(prev => !prev)
    },
    [target, targetFlow, menuOpen]
  )

  return (
    <div
      className="flow-grid"
      ref={flowGridRef}
      onClick={() => {
        menuOpen && setMenuOpen(false)
      }}>
      {flows.map((flow, _) => (
        <button
          key={flow.id}
          className="flow-button"
          onClick={() => {
            toFlow(flow)
          }}
          onContextMenu={event => {
            handleContextMenu(event, flow)
          }}>
          <img
            src={flow.thumbnail !== '' ? flow.thumbnail : '/images/no-img.svg'}
            alt={flow.title}
          />
          <p>{flow.title}</p>
        </button>
      ))}
      <Menu open={menuOpen} className="flow-menu" anchorEl={target}>
        <MenuItem
          onClick={() => {
            setRenameDialogOpen(true)
            setMenuOpen(false)
          }}>
          {translate('Rename')}
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (targetFlow === null) return
            await removeFlow(targetFlow.id)
          }}>
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
