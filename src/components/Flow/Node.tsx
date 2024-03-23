import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'

import { ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'
import { Handle, NodeResizeControl, NodeToolbar, Position } from 'reactflow'
import { useFlowController } from '../../providers/FlowController'
import { useLanguage } from '../../providers/i18next'

import './FlowEditor.scss'
import './Node.scss'

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 5, bottom: 5 }}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  )
}

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
      <NodeResizeControl
        className="resize-control"
        minWidth={50}
        minHeight={50}
        onResize={(_, params) => {
          if (id === nodeEditingId) return
          const newFontSize = onNodeResize(_, params, id)
          setFontSize(newFontSize)
        }}>
        {id === lastSelectedNode?.id && id !== nodeEditingId && <ResizeIcon />}
      </NodeResizeControl>

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

      <Handle
        id={'left'}
        type="target"
        position={Position.Left}
        className="handle"
      />
      <Handle
        id={'right'}
        type="source"
        position={Position.Right}
        className="handle"
      />
    </div>
  )
}

export default memo(CustomNode)
