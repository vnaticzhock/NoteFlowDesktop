import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import EditorToolbar, { modules, formats } from './EditorToolbar'
import 'react-quill/dist/quill.snow.css'
import './Editor.scss'
import { IoIosArrowBack } from 'react-icons/io'
import { BsShare } from 'react-icons/bs'
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md'

import 'katex/dist/katex.min.css'
import { Button, IconButton } from '@mui/material'
import EditorSettings from './EditorSettings'
import { editNodeContent, fetchNode, editNodeTitle } from '../../apis/APIs'

const katex = import('katex')

window.katex = katex
const Editor = ({ handleDrawerClose, editorId }) => {
  // what users see!
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitle')
  const [tempTitle, setTempTitle] = useState(title)
  const [hasUpdated, setHasUpdated] = useState(true)
  const [colab, setColab] = useState([])

  // programming logic:)
  const [showSettings, setShowSettings] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const [canEdit, setCanEdit] = useState(true)

  useEffect(() => {
    if (hasUpdated) return

    const interval = setTimeout(() => {
      editNodeContent(editorId, content)
    }, 500)

    return () => clearTimeout(interval)
  }, [content, hasUpdated])

  useEffect(() => {
    // quill-editor, editor-settings
    const toolbar = document.querySelector('#toolbar')
    const editor = document.querySelector('#quill-editor')

    if (showSettings) {
      toolbar.style.pointerEvents = 'none'
      toolbar.style.opacity = '0.5'

      editor.style.display = 'none'
    } else {
      toolbar.style.pointerEvents = 'auto'
      toolbar.style.opacity = '1'

      editor.style.display = ''
    }
  }, [showSettings])

  useEffect(() => {
    console.log('fetching quill content')
    fetchNode(editorId).then((res) => {
      res = res[0]
      setContent(res.content)
      setTitle(res.title)
      setTempTitle(res.title)
    })
  }, [])

  return (
    <div className="editor">
      <div className="header">
        <div className="left">
          <IconButton
            size="large"
            onClick={() => {
              handleDrawerClose()
            }}
          >
            <IoIosArrowBack size={20} />
          </IconButton>
          <input
            className="title-input"
            type="text"
            placeholder="Untitled..."
            value={tempTitle}
            onChange={(e) => {
              setTempTitle(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                editNodeTitle(editorId, tempTitle)
              }
            }}
          />
          <span className="focus-border"></span>
        </div>
        <div className="right">
          <Button
            variant="dark"
            onClick={() => {
              if (canEdit) setShowSettings((state) => !state)
            }}
            className="toolBarButton"
          >
            <BsShare size={18} />
          </Button>
          <Button
            variant="dark"
            size="small"
            onClick={() => {
              const fav = favorite
              setFavorite((state) => !state)
            }}
            className="toolBarButton"
          >
            {favorite ? (
              <MdFavorite size={18} />
            ) : (
              <MdFavoriteBorder size={18} />
            )}
          </Button>

          {!canEdit && (
            <div className="viewOnly" style={{ color: '#828282' }}>
              view only
            </div>
          )}

          <div className="users">
            {/* 右上角可愛的大頭貼 */}
            {colab.map((element, index) => {
              return (
                <div className="user" key={index}>
                  <img src={element.picture} alt="" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="text-editor">
        <EditorToolbar />
        {showSettings ? (
          <EditorSettings
            editorId={editorId}
            setShowSettings={setShowSettings}
          />
        ) : (
          <></>
        )}
        <ReactQuill
          theme="snow"
          value={content}
          onChange={(e) => {
            setContent(e)
            setHasUpdated(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              // setStatus(STATE.turb)
            }
          }}
          on
          placeholder={'Write something awesome...'}
          modules={modules}
          formats={formats}
          className="editor-input"
          id="quill-editor"
          // ref={QuillRef}
        />
      </div>
    </div>
  )
}

export { Editor }
