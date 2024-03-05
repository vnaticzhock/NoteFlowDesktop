import { Input, ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Handle, NodeResizer, NodeToolbar, Position } from 'reactflow'
import './FlowEditor.scss'
// import styled from "styled-components";
import ClickAwayListener from '@mui/material/ClickAwayListener'
// import { useParams } from '../../hooks/useParams'
import { useLanguage } from '../../providers/i18next'
import { useFlowManager } from '../../providers/FlowManager'
import './Node.scss'

const CustomNode = ({ id, data }) => {
  const { translate } = useLanguage()
  // const [isVisible, setVisible] = useState(false);
  const [isInputDisable, setIsInputDisable] = useState(true)
  const [isResizable, setIsResizable] = useState(false)
  const [label, setLabel] = useState(data.label)
  const { rightClicked, setRightClicked, needUpdatedHandler } = useFlowManager()
  // const { nodeMenuOpen, setNodeMenuOpen } = useParams()

  const handleRightClick = (event) => {
    event.preventDefault()
    setRightClicked(id)
  }

  const handleStopTyping = useCallback(
    (event) => {
      if (event.keyCode == 13) {
        setIsInputDisable(true)
        data.onLabelStopEdit()
        needUpdatedHandler('nodes', id, {
          label,
        })
      }
    },
    [label],
  )

  const handleCloseMenu = () => setRightClicked(-1)

  return (
    <div
      // id={`react-node-${id}`}
      id={id}
      onContextMenu={handleRightClick}
    >
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
              <MenuItem
                onClick={(event) => {
                  data.onLabelChange(id, event)
                  data.onLabelEdit(id)
                  setIsInputDisable(false)
                }}
              >
                <ListItemText>{translate('Rename')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => data.openStyleBar(id)}>
                <ListItemText>{translate('Change Style')}</ListItemText>
              </MenuItem>
            </MenuList>
          </Paper>
        </ClickAwayListener>
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
          // value={'select me!'}
          onChange={(event) => {
            setLabel(event.target.value)
          }}
          disabled={isInputDisable}
          onKeyDown={(event) => {
            handleStopTyping(event)
          }}
        />
      </div>
      <Handle
        type="target"
        id={'left'}
        position={Position.Left}
        onConnect={(param) => {
          console.log('handle connect', param)
        }}
      />
      <Handle id={'right'} type="source" position={Position.Right} />
    </div>
  )
}

export default memo(CustomNode)
