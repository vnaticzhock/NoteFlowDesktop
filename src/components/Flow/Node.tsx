import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { ListItemText, MenuItem, MenuList, Paper } from '@mui/material'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { Handle, NodeResizeControl, NodeToolbar, Position } from 'reactflow'
import {
  addNodeToFavorite,
  fetchIsFavorite,
  removeNodeFromFavorite
} from '../../apis/APIs'
import { useFlowController } from '../../providers/FlowController'
import { useLanguage } from '../../providers/i18next'
import { defaultNodeHeight, defaultNodeWidth } from './DefaultNodeStyle'
import './FlowEditor.scss'
import './Node.scss'

function ResizeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      fill="#141414"
      stroke="#141414"
      transform="rotate(90)"
      style={{ position: 'absolute', right: 5, bottom: 5 }}>
      <polyline
        points="304 96 416 96 416 208"
        style={{
          fill: 'none',
          stroke: '#000000',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '32px'
        }}
      />

      <line
        x1="405.77"
        y1="106.2"
        x2="111.98"
        y2="400.02"
        style={{
          fill: 'none',
          stroke: '#000000',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '32px'
        }}
      />

      <polyline
        points="208 416 96 416 96 304"
        style={{
          fill: 'none',
          stroke: '#000000',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '32px'
        }}
      />
    </svg>
  )
}

const CustomNodeToolbar = ({ id, onNodeResize, setFontSize }) => {
  const [showIcon, setShowIcon] = useState<boolean>(false)
  const [bookmarked, setBookmarked] = useState<boolean>(false)

  useEffect(() => {
    fetchIsFavorite(id).then(isFavorite => {
      setBookmarked(isFavorite)
    })
  }, [id])
  return (
    <div
      className="custom-node-toolbar"
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}>
      <div className="node-interact-area">
        {showIcon &&
          (bookmarked ? (
            <BookmarkIcon
              className="bookmark-icon"
              fontSize="inherit"
              cursor="pointer"
              onClick={() => {
                setBookmarked(false)
                removeNodeFromFavorite(id)
              }}
            />
          ) : (
            <BookmarkBorderIcon
              className="bookmark-icon"
              fontSize="inherit"
              cursor="pointer"
              onClick={() => {
                setBookmarked(true)
                addNodeToFavorite(id)
              }}
            />
          ))}
      </div>
      <NodeResizeControl
        className="resize-control"
        minWidth={defaultNodeWidth + 10}
        minHeight={defaultNodeHeight}
        onResize={(_, params) => {
          const newFontSize = onNodeResize(_, params, id)
          setFontSize(newFontSize)
        }}>
        {showIcon && <ResizeIcon />}
      </NodeResizeControl>
    </div>
  )
}

const CustomNode = ({ id, data }) => {
  const { translate } = useLanguage()
  const [fontSize, setFontSize] = useState<number>(12)
  const [nodeEditorInitialContent, setNodeEditorInitialContent] = useState<
    PartialBlock[] | undefined | 'loading'
  >('loading')

  const {
    lastSelectedNode,
    lastRightClickedNodeId,
    onNodeResize,
    openStyleBar,
    startNodeEditing,
    nodeEditorContent,
    editorId,
    nodeEditorId,
    setEditorInitContent
  } = useFlowController()

  // load initial node content from the flow nodes data
  useEffect(() => {
    if (data.content !== undefined && data.content !== '') {
      const content = JSON.parse(data.content) as PartialBlock[]
      nodeEditorContent[id] = content
      setNodeEditorInitialContent(content)
    } else {
      setNodeEditorInitialContent(undefined)
    }
  }, [data])

  const nodeEditor = useMemo(() => {
    if (nodeEditorInitialContent === 'loading') {
      return undefined
    } else if (nodeEditorInitialContent === undefined) {
      return BlockNoteEditor.create({})
    }

    return BlockNoteEditor.create({ initialContent: nodeEditorInitialContent })
  }, [nodeEditorInitialContent])

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
        borderRadius: '15px',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%'
      }}>
      <CustomNodeToolbar
        id={id}
        onNodeResize={onNodeResize}
        setFontSize={setFontSize}
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
      <div className="editor-container">
        {nodeEditor ? (
          <BlockNoteView
            editor={nodeEditor}
            onFocus={() => {
              if (nodeEditorId !== id) startNodeEditing(id)
            }}
            onChange={() => {
              // update editor content if main editor is open and has the same id
              if (editorId === id) {
                setEditorInitContent(nodeEditor.document)
              }
              // update node editor content temporarily.
              nodeEditorContent[id] = nodeEditor.document
            }}
            formattingToolbar={true}
            linkToolbar={true}
            sideMenu={true}
            slashMenu={true}
            imageToolbar={true}
            tableHandles={true}></BlockNoteView>
        ) : (
          'Loading content...'
        )}
      </div>

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
