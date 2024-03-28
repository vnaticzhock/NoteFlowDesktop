import { Block } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/react'
import '@blocknote/react/style.css'
import React, { useEffect } from 'react'
import { useFlowController } from '../../providers/FlowController.jsx'
import './Editor.scss'

export default function Editor({ editorId }) {
  const { editor, updateEditor, editorContent } = useFlowController()

  useEffect(() => {
    console.log(editorContent)
    if (editor === undefined || editorContent === undefined) return
    editor
      .tryParseHTMLToBlocks(editorContent)
      .then(blocks => editor.replaceBlocks(editor.document, blocks))
  }, [editor, editorContent])

  const saveToStorage = async (jsonBlocks: Block[]) => {
    const htmlContent = await editor.blocksToHTMLLossy(editor.document)
    updateEditor(editorId, htmlContent)
  }

  if (editor === undefined) {
    return 'Loading content...'
  }

  return (
    <div className="container">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          saveToStorage(editor.document)
        }}
      />
    </div>
  )
}
