import React from 'react';
import { BsShare } from 'react-icons/bs';
import { IoIosArrowBack } from 'react-icons/io';
import { MdFavoriteBorder } from 'react-icons/md';
import ReactQuill from 'react-quill';
import './Editor.scss';
import EditorToolbar, { formats, modules } from './EditorToolbar';

import { Button, IconButton } from '@mui/material';
import 'katex/dist/katex.min.css';
import { useApp } from '../../hooks/useApp';

const SuspenseEditor = () => {
  const { isMobile } = useApp();
  return (
    <div>
      <div className={`${isMobile ? 'editor-mobile' : 'editor'}`}>
        <div className="header">
          <IconButton
            size="large"
            onClick={() => {
              handleDrawerClose();
            }}
          >
            <IoIosArrowBack size={20} />
          </IconButton>
          <input className="title-input" type="text" placeholder="" />
          <span className="focus-border" on></span>
          <div className="status-holder"></div>
          <Button variant="dark" className="toolBarButton">
            <BsShare size={18} />
          </Button>
          <Button variant="dark" size="small" className="toolBarButton">
            <MdFavoriteBorder size={18} />
          </Button>
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
          />
        </div>
      </div>
    </div>
  );
};

export default SuspenseEditor;
