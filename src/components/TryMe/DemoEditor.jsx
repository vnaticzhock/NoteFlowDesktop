import { Button, IconButton } from '@mui/material'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import React, { useEffect, useRef, useState } from 'react'
import { BsShare } from 'react-icons/bs'
import { IoIosArrowBack } from 'react-icons/io'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import EditorToolbar, { formats, modules } from '../Editor/EditorToolbar'
import './DemoEditor.scss'
// import instance from '../../API/api';
import Typing from './Typing'

const opening = `Hello, this is a text editor, \n\nJust like every other editor, you can write down anything amazing! \n\nBut we also provide you with some cool features.\n\nTry some of them in the toolbar!
`
const example_1 = `For example, you can add a link of Youtube video in the editor: \n\n`
const example_2 = `Or you can add math notation in Latex, below is the recursive function of the Fibonacci sequence: \n\n`
const closing = `There are still a lot of features you can discover!\n\nDon't hesitate to try!`

window.katex = katex

const DemoEditor = ({ handleDrawerClose, editorId }) => {
  const [state, setState] = useState({
    title: '',
    value: '',
  })

  const [favorite, setFavorite] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [colab, setColab] = useState([])
  const [text, setText] = useState('')
  const [editor, setEditor] = useState(null)
  const QuillRef = useRef(null)

  let TypingEffect

  useEffect(() => {
    if (!QuillRef) return
    setEditor(QuillRef.current.getEditor())

    if (!editor) return

    TypingEffect = new Typing(40)
    TypingEffect.type(opening, setText)

    let t1 = setTimeout(
      () => {
        TypingEffect.type(example_1, setText)
        let t2 = setTimeout(
          () => {
            editor.insertEmbed(
              editor.getLength(),
              'video',
              'https://www.youtube.com/watch?v=IK5tS1O9y94',
            )
            let t3 = setTimeout(() => {
              TypingEffect.type(example_2, setText)
              let t4 = setTimeout(
                () => {
                  editor.formatText(example_2.indexOf('Latex'), 5, 'bold', true)
                  editor.insertEmbed(editor.getLength(), 'formula', 'F_{0}=0')
                  editor.insertEmbed(editor.getLength(), 'formula', 'F_{1}=1')
                  editor.insertEmbed(
                    editor.getLength(),
                    'formula',
                    'F_{n}=F_{n-1}+F_{n-2}',
                  )
                  let t5 = setTimeout(() => {
                    TypingEffect.type(closing, setText)
                  }, 4000)
                  // clearTimeout(t5);
                },
                40 * example_2.length + 1000,
              )
              // clearTimeout(t4);
            }, 3000)
            // clearTimeout(t3);
          },
          40 * example_1.length + 500,
        )
        // clearTimeout(t2);
      },
      40 * opening.length + 500,
    )
    // clearTimeout(t1);

    return () => {
      TypingEffect.close()
    }
  }, [QuillRef, editor])

  useEffect(() => {
    if (!editor || editor.hasFocus()) return
    editor.setContents([{ insert: text }])
  }, [editor, text])

  return (
    <div className="demo-editor">
      <div className="header">
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
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value)
          }}
        />
        <span className="focus-border"></span>
        <Button variant="dark" className="toolBarButton">
          <BsShare size={18} />
        </Button>
        <Button
          variant="dark"
          size="small"
          // onClick={() => {
          //   const fav = favorite;
          //   setFavorite((state) => !state);
          //   instance.post(!fav ? '/library/add-node' : 'library/remove-node', {
          //     id: editorId,
          //   });
          // }}
          className="toolBarButton"
        >
          {favorite ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
        </Button>

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
      <div className="text-editor">
        <EditorToolbar />
        <ReactQuill
          theme="snow"
          value={state}
          onChange={setState}
          placeholder={'Write something awesome...'}
          modules={modules}
          formats={formats}
          className="editor-input"
          id="quill-editor"
          ref={QuillRef}
        />
      </div>
    </div>
  )
}

export default DemoEditor
