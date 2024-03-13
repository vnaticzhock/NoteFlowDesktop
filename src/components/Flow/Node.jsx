import './FlowEditor.scss'
import './Node.scss'

import { Input, ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
// import styled from "styled-components";
import ClickAwayListener from '@mui/material/ClickAwayListener'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Handle, NodeResizer, NodeToolbar, Position } from 'reactflow'

import { useFlowController } from '../../providers/FlowController'
import { useFlowManager } from '../../providers/FlowManager'
// import { useParams } from '../../hooks/useParams'
import { useLanguage } from '../../providers/i18next'

const CustomNode = ({ id, data }) => {
  const { translate } = useLanguage()
  const [isInputDisable, setIsInputDisable] = useState(true)
  const [isResizable, setIsResizable] = useState(false)
  const [label, setLabel] = useState(data.label)
  const { rightClicked, setRightClicked, needUpdatedHandler } = useFlowManager()

  const handleRightClick = (event) => {
    event.preventDefault()
    setRightClicked(id)
  }

  const { isNodeSelected, selectedNodes } = useFlowController()

  const isSelected = useMemo(() => {
    return isNodeSelected(id)
  }, [selectedNodes])

  useEffect(() => {
    if (isSelected) {
      setIsResizable(true)
    } else {
      setIsResizable(false)
    }
  }, [isSelected])

  const handleStopTyping = useCallback(
    (event) => {
      if (event.keyCode !== 13) return
      setIsInputDisable(true)
      needUpdatedHandler('nodes', id, {
        label,
      })
    },
    [label],
  )

  const handleCloseMenu = () => setRightClicked(-1)

  const handleClickAway = () => {
    handleCloseMenu()
    setIsInputDisable(true)
    needUpdatedHandler('nodes', id, {
      label,
    })
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div id={id} onContextMenu={handleRightClick}>
        <NodeResizer
          minHeight={50}
          minWidth={150}
          handleStyle={{ padding: '3px' }}
          lineStyle={{ border: '1px solid', borderColor: '#1e88e5' }}
          isVisible={isResizable}
        />
        <NodeToolbar
          isVisible={rightClicked == id}
          position={data.toolbarPosition}
        >
          <Paper>
            <MenuList>
              <MenuItem
                onClick={(event) => {
                  setIsInputDisable(false)
                  handleCloseMenu()
                  console.log('?')
                }}
              >
                <ListItemText>{translate('Rename')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => data.openStyleBar(id)}>
                <ListItemText>{translate('Change Style')}</ListItemText>
              </MenuItem>
            </MenuList>
          </Paper>
        </NodeToolbar>

        <div id="labelInput">
          <Input
            sx={{
              borderColor: 'transparent',
              borderRadius: 40,
              textAlign: 'center',
              justifyContent: 'center',
              height: 50,
              width: 150,
              paddingLeft: 2,
              color: 'red',
              '& input.Mui-disabled': {
                WebkitTextFillColor: 'black',
              },
              pointerEvents: isInputDisable ? 'none' : 'auto',
            }}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
            }}
            disabled={isInputDisable}
            onKeyDown={handleStopTyping}
          />
        </div>
        <Handle id={'left'} type="target" position={Position.Left} />
        <Handle id={'right'} type="source" position={Position.Right} />
      </div>
    </ClickAwayListener>
  )
}

export default memo(CustomNode)
