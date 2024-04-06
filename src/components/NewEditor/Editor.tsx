import { BlockNoteEditor } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import React, { useMemo } from 'react'
import './Editor.scss'

export default function Editor({ editorId, editorInitContent, updateEditor }) {
  const editor = useMemo(() => {
    if (editorInitContent === 'loading') {
      return null
    } else if (editorInitContent === undefined) {
      return BlockNoteEditor.create()
    }
    return BlockNoteEditor.create({ initialContent: editorInitContent })
  }, [editorInitContent])

  if (editor === null) {
    return 'Loading content...'
  }

  return (
    <div className="container">
      <BlockNoteView
        editor={editor}
        onChange={() => updateEditor(editorId, editor.document)}
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
