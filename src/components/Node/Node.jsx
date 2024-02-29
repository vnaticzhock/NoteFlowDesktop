import { Editor } from '../Editor/Editor'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
// import { useApp } from '../../hooks/useApp'
// import instance from '../../API/api';
import React from 'react'
import SuspenseEditor from '../Editor/SuspenseEditor'

import './Node.scss'

const Node = ({ nodeId, setIsEdit, nodeWidth, setNodeIsEditing }) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const editorId = nodeId ? nodeId : searchParams.get('id')
  //   const { isMobile } = useApp()

  const navigateTo = useNavigate()

  const handleDrawerClose = () => {
    if (!nodeId) navigateTo('/')
    else {
      setIsEdit(false)
      setNodeIsEditing(null)
    }
  }

  console.log('nodeid', editorId)

  return (
    <div
      className="Node-container"
      style={nodeId && { width: `${nodeWidth}px` }}
    >
      <div className="editor">
        <React.Suspense fallback={<SuspenseEditor />}>
          <Editor editorId={editorId} handleDrawerClose={handleDrawerClose} />
        </React.Suspense>
      </div>
    </div>
  )
}
export default Node
