import { ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import MDEditor from '@uiw/react-md-editor'
import React, { memo, useCallback, useState } from 'react'
import { Handle, NodeResizer, NodeToolbar, Position } from 'reactflow'
import { useFlowController } from '../../providers/FlowController'
import { useLanguage } from '../../providers/i18next'
import './FlowEditor.scss'
import './Node.scss'

const CustomNode = ({ id, data }) => {
  const { translate } = useLanguage()
  const [isInputDisable, setIsInputDisable] = useState(true)
  const [label, setLabel] = useState(data.label)
  const {
    lastSelectedNode,
    lastRightClickedNodeId,
    onNodeResizeEnd,
    onNodeLabelChange,
    openStyleBar
  } = useFlowController()

  const onChangeLabel = useCallback(
    event => {
      if (event.keyCode !== 13) return
      setIsInputDisable(true)
      onNodeLabelChange(id, label)
    },
    [label]
  )

  return (
    <div id={id} className="node-card">
      <NodeResizer
        minHeight={50}
        minWidth={50}
        handleStyle={{ padding: '1px' }}
        lineStyle={{ border: '1px dotted black', padding: 0 }}
        isVisible={id === lastSelectedNode?.id}
        onResizeEnd={(_, params) => onNodeResizeEnd(_, params, id)}
      />
      <NodeToolbar
        isVisible={lastRightClickedNodeId === id}
        position={data.toolbarPosition}>
        <Paper>
          <MenuList>
            <MenuItem
              onClick={event => {
                setIsInputDisable(false)
              }}>
              <ListItemText>{translate('Rename')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => openStyleBar(id)}>
              <ListItemText>{translate('Change Style')}</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </NodeToolbar>

      <div className="card-container">
        <MDEditor.Markdown source={data.content.content} />
      </div>

      <Handle id={'left'} type="target" position={Position.Left} />
      <Handle id={'right'} type="source" position={Position.Right} />
    </div>
  )
}

export default memo(CustomNode)
