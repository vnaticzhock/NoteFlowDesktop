import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import { ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { Handle, NodeResizeControl, NodeToolbar, Position } from 'reactflow'
import { useFlowController } from '../../providers/FlowController'
import { useLanguage } from '../../providers/i18next'
import { defaultNodeHeight, defaultNodeWidth } from './DefaultNodeStyle'

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
  const [nodeEditorInitialContent, setNodeEditorInitialContent] = useState<
    PartialBlock[] | undefined | 'loading'
  >('loading')
  const nodeEditorRef = React.useRef<any | null>(null)

  const {
    lastSelectedNode,
    lastRightClickedNodeId,
    onNodeResize,
    openStyleBar,
    setNodeEditorContent,
    editorId,
    nodeEditorId,
    setEditorInitContent
  } = useFlowController()

  const nodeEditor = useMemo(() => {
    if (nodeEditorInitialContent === 'loading') {
      return undefined
    } else if (nodeEditorInitialContent === undefined) {
      return BlockNoteEditor.create()
    }
    return BlockNoteEditor.create({ initialContent: nodeEditorInitialContent })
  }, [nodeEditorInitialContent])

  useEffect(() => {
    if (data.content !== undefined && data.content !== '') {
      setNodeEditorInitialContent(JSON.parse(data.content) as PartialBlock[])
    } else {
      setNodeEditorInitialContent(undefined)
    }
  }, [data])

  useEffect(() => {
    if (nodeEditor !== undefined && nodeEditor === id) {
      setNodeEditorContent(nodeEditor.document)
    }
  }, [nodeEditor, nodeEditorId])

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
    <div
      id={id}
      className="node-card"
      style={{
        border:
          id === lastSelectedNode?.id ? '2px solid red' : '2px solid black',
        width: '100%',
        height: '100%',
        borderRadius: '15px',
        boxSizing: 'border-box'
      }}>
      <NodeResizeControl
        className="resize-control"
        minWidth={defaultNodeWidth}
        minHeight={defaultNodeHeight}
        onResize={(_, params) => {
          const newFontSize = onNodeResize(_, params, id)
          setFontSize(newFontSize)
        }}>
        {id === lastSelectedNode?.id && <ResizeIcon />}
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

      {nodeEditor && (
        <div className="editor-container">
          <BlockNoteView
            ref={nodeEditorRef}
            editor={nodeEditor}
            onChange={() => {
              // update editor content if maion editor is open and has the same id
              if (editorId === id) {
                setEditorInitContent(nodeEditor.document)
              }
              // update node editor content temporarily.
              if (nodeEditorId === id) {
                setNodeEditorContent(nodeEditor.document)
              }
            }}
            autoFocus={true}
            formattingToolbar={true}
            linkToolbar={true}
            sideMenu={true}
            slashMenu={true}
            imageToolbar={true}
            tableHandles={true}
            theme="dark"
          />
        </div>
      )}

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
