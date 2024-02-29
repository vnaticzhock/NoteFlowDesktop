import React, { memo, useState, useCallback, useEffect, useRef } from 'react'
import { Handle, Position, NodeToolbar, NodeResizer } from 'reactflow'
import './FlowEditor.scss'
import { MenuList, MenuItem, ListItemText, Input, Paper } from '@mui/material'
// import styled from "styled-components";
import ClickAwayListener from '@mui/material/ClickAwayListener'
// import { useParams } from '../../hooks/useParams'
import { useTranslation } from 'react-i18next'
import { useFlowManager } from '../../providers/FlowManager'
import './Node.scss'

const CustomNode = ({ id, data }) => {
  const { t } = useTranslation()
  // const [isVisible, setVisible] = useState(false);
  const [isInputDisable, setIsInputDisable] = useState(true)
  const [isResizable, setIsResizable] = useState(false)
  const [label, setLabel] = useState(data.label)
  const { rightClicked, setRightClicked } = useFlowManager()
  // const { nodeMenuOpen, setNodeMenuOpen } = useParams()

  const handleRightClick = (event) => {
    event.preventDefault()
    setRightClicked(id)
  }

  const handleStopTyping = (event) => {
    if (event.keyCode == 13) {
      setIsInputDisable(true)
      data.onLabelStopEdit()
    }
  }

  const updateLabelHandler = () => {}

  const handleCloseMenu = () => setRightClicked(-1)

  return (
    <div
      // id={`react-node-${id}`}
      id={id}
      onContextMenu={handleRightClick}
    >
      {/* <div id={id} onDoubleClick={onContextMenu}> */}
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
        <ClickAwayListener onClickAway={handleCloseMenu}>
          <Paper>
            <MenuList>
              {/* <MenuItem onClick={() => setIsResizable(!isResizable)}>
                <ListItemText>
                  {isResizable ? 'Complete' : 'Resize'}
                </ListItemText>
              </MenuItem> */}
              <MenuItem
                onClick={(event) => {
                  data.onLabelChange(id, event)
                  data.onLabelEdit(id)
                  setIsInputDisable(false)
                }}
              >
                <ListItemText>{t('Rename')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => data.openStyleBar(id)}>
                <ListItemText>{t('Change Style')}</ListItemText>
              </MenuItem>
              {/* <MenuItem onClick={() => setVisible(setNodeMenuOpen(null))}>
                <ListItemText>CloseMenu</ListItemText>
              </MenuItem> */}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </NodeToolbar>
      {/* <ClickAwayListener onClickAway={handleCloseMenu}> */}
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
          // value={'select me!'}
          onChange={(event) => {
            setLabel(event.target.value)
            data.label = event.target.value
            data.editLabel(id, event.target.value)
          }}
          disabled={isInputDisable}
          onClick={() => {
            console.log("don't click me!")
          }}
          onKeyDown={() => handleStopTyping(event)}
        />
      </div>
      {/* </ClickAwayListener> */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default memo(CustomNode)
