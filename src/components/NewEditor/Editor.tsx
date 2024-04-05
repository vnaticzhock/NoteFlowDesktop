import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import React, { useEffect, useMemo } from 'react'
import { useFlowController } from '../../providers/FlowController.jsx'
import './Editor.scss'

export default function Editor({ editorId }) {
  const {
    updateEditor,
    loadNodeContent,
    editorInitContent,
    setEditorInitContent
  } = useFlowController()

  const editor = useMemo(() => {
    if (editorInitContent === 'loading') {
      return null
    } else if (editorInitContent === undefined) {
      return BlockNoteEditor.create()
    }
    return BlockNoteEditor.create({ initialContent: editorInitContent })
  }, [editorInitContent])

  useEffect(() => {
    if (editorId) {
      loadNodeContent(editorId).then(content => {
        if (content !== undefined && content !== '')
          setEditorInitContent(JSON.parse(content) as PartialBlock[])
        else setEditorInitContent(undefined)
      })
    }
  }, [editorId])

  if (editor === null) {
    return 'Loading content...'
  }

  return (
    <div className="container">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          updateEditor(editor.document, editorId)
        }}
        formattingToolbar={true}
        linkToolbar={true}
        sideMenu={true}
        slashMenu={true}
        imageToolbar={true}
        tableHandles={true}
        theme="dark"
      />
    </div>
  )
}
