import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'

import { ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'
import { Handle, NodeResizer, NodeToolbar, Position } from 'reactflow'
import { useFlowController } from '../../providers/FlowController'
import { useLanguage } from '../../providers/i18next'

import './FlowEditor.scss'
import './Node.scss'

const CustomNode = ({ id, data }) => {
  const { translate } = useLanguage()
  const [fontSize, setFontSize] = useState<number>(12)
  const [htmlContent, setHtmlContent] = useState<string | undefined>(undefined)
  const htmlContentRef = React.useRef<HTMLDivElement | null>(null)

  const {
    lastSelectedNode,
    lastRightClickedNodeId,
    onNodeResize,
    openStyleBar,
    editor,
    nodeEditingId
  } = useFlowController()

  useEffect(() => {
    if (nodeEditingId !== id) {
      setHtmlContent(data.content)
    } else {
      editor.blocksToHTMLLossy(editor.document).then(html => {
        setHtmlContent(html)
      })
    }
  }, [data])

  useEffect(() => {
    if (htmlContent) {
      htmlContentRef.current!.innerHTML = htmlContent
    }
  }, [htmlContent])

  // This is a workaround for the ResizeObserver error that is thrown by the react-flow library
  // Should be removed in the future
  useEffect(() => {
    const errorHandler = (e: any) => {
      if (
        e.message.includes(
          'ResizeObserver loop completed with undelivered notifications' ||
            'ResizeObserver loop limit exceeded'
        )
      ) {
        const resizeObserverErr = document.getElementById(
          'webpack-dev-server-client-overlay'
        )
        if (resizeObserverErr) {
          resizeObserverErr.style.display = 'none'
        }
      }
    }
    window.addEventListener('error', errorHandler)

    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [])

  return (
    <div id={id} className="node-card">
      <NodeResizer
        minHeight={50}
        minWidth={50}
        handleStyle={{ padding: '1px' }}
        lineStyle={{ border: '1px dotted black', padding: 0 }}
        isVisible={id === lastSelectedNode?.id}
        onResize={(_, params) => {
          const newFontSize = onNodeResize(_, params, id)
          setFontSize(newFontSize)
        }}
      />
      <NodeToolbar
        isVisible={lastRightClickedNodeId === id}
        position={data.toolbarPosition}>
        <Paper>
          <MenuList>
            <MenuItem onClick={() => openStyleBar(id)}>
              <ListItemText>{translate('Change Style')}</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </NodeToolbar>

      <div
        className="card-container"
        ref={htmlContentRef}
        style={{ fontSize: `${fontSize}px` }}></div>

      <Handle id={'left'} type="target" position={Position.Left} />
      <Handle id={'right'} type="source" position={Position.Right} />
    </div>
  )
}

export default memo(CustomNode)
