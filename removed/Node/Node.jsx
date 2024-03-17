import './Node.scss'

import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Editor } from '../Editor/Editor'
import SuspenseEditor from '../Editor/SuspenseEditor'

const Node = ({ nodeId, nodeWidth, leaveEditing }) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const editorId = nodeId || searchParams.get('id')
  //   const { isMobile } = useApp()

  const navigateTo = useNavigate()

  const handleDrawerClose = () => {
    leaveEditing()
  }

  console.log('nodeid', editorId)

  return (
    <div
      className="Node-container"
      style={nodeId && { width: `${nodeWidth}px` }}>
      <div className="editor">
        <React.Suspense fallback={<SuspenseEditor />}>
          <Editor editorId={editorId} handleDrawerClose={handleDrawerClose} />
        </React.Suspense>
      </div>
    </div>
  )
}
export default Node
