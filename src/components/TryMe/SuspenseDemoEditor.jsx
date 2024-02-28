import React from 'react'
import ReactQuill from 'react-quill'
import './DemoEditor.scss'
// import { useApp } from '../../hooks/useApp';
import 'react-quill/dist/quill.snow.css'
import EditorToolbar, { modules, formats } from '../Editor/EditorToolbar'
import { IoIosArrowBack } from 'react-icons/io'
import { BsShare } from 'react-icons/bs'
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md'
import { Button, IconButton } from '@mui/material'
import { useState } from 'react'

const SuspenseDemoEditor = () => {
  const [favorite, setFavorite] = useState(false)
  return (
    <div className="demo-editor">
      <div className="header">
        <IconButton size="large">
          <IoIosArrowBack size={20} />
        </IconButton>
        <input className="title-input" type="text" placeholder="Untitled..." />
        <span className="focus-border"></span>
        <Button variant="dark" className="toolBarButton">
          <BsShare size={18} />
        </Button>
        <Button
          variant="dark"
          size="small"
          className="toolBarButton"
          onClick={() => {
            setFavorite((prev) => !prev)
          }}
        >
          {favorite ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
        </Button>

        <div className="users"></div>
      </div>
      <div className="text-editor">
        <EditorToolbar />
        <ReactQuill
          theme="snow"
          placeholder={'Write something awesome...'}
          modules={modules}
          formats={formats}
          className="editor-input"
          id="quill-editor"
        />
      </div>
    </div>
  )
}

export default SuspenseDemoEditor
