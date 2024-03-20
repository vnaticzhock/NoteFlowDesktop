import MDEditor from '@uiw/react-md-editor'
import React, { useEffect, useState } from 'react'
import { useFlowController } from '../../providers/FlowController'
import './Editor.scss'

export default function Editor({ editorId, handleDrawerClose }) {
  const [value, setValue] = useState<string>('**Hello world!!!**')
  const { nodes } = useFlowController()

  useEffect(() => {
    const node = nodes.find(node => node.id === editorId)
    if (node) setValue(node.data.content)
  }, [editorId])

  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={(_, event, __) => {
          if (event?.target.value) setValue(event?.target.value)
        }}
        hideToolbar={true}
      />
      <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
    </div>
  )
}
