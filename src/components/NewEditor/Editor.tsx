import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import React, { useEffect } from 'react'
import { useFlowController } from '../../providers/FlowController.jsx'
import './Editor.scss'

export default function Editor({ editorId }) {
  const { editor, updateEditor, editorInitContent } = useFlowController()

  // initialize editor content
  useEffect(() => {
    if (editor === null || editorInitContent === 'loading') return
    else {
      editor
        .tryParseHTMLToBlocks(editorInitContent)
        .then(blocks => editor.replaceBlocks(editor.document, blocks))
    }
  }, [editor, editorInitContent])

  if (editor === null) {
    return 'Loading content...'
  }

  return (
    <div className="container">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          updateEditor(editor, editorId)
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
