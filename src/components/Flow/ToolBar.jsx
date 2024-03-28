import './FlowEditor.scss'
import './ToolBar.scss'

import InsightsIcon from '@mui/icons-material/Insights'
import { Menu, MenuItem } from '@mui/material'
import Button from '@mui/material/Button'
import React, { useState } from 'react'
import { AiOutlineBorderlessTable, AiOutlineEdit } from 'react-icons/ai'
import { BiCross, BiFirstPage } from 'react-icons/bi'
import {
  BsBookmarkHeart,
  BsDot,
  BsNodePlus,
  BsPalette,
  BsShare
} from 'react-icons/bs'

import { useLanguage } from '../../providers/i18next'
import ChatBot from '../FlowTool/ChatBot'
import Colabs from '../FlowTool/Colabs'

export default function ToolBar({
  addNode,
  backToHome,
  changeBackground,
  flowId,
  isNodeSelected,
  handleNodeBarOpen,
  openNodeContextMenu
}) {
  const { translate } = useLanguage()
  const [show, setShow] = useState(false)
  // const { flowWebSocket, renewFlowWebSocket } = usePageTab()
  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <nav className="navbar">
      <div className="left">
        <Button
          variant="dark"
          onClick={() => {
            backToHome()
            // renewFlowWebSocket(null)
          }}
          className="toolBarButton lastPageButton">
          <BiFirstPage size={18} />
        </Button>
      </div>
      <div className="mid">
        <Button
          variant="dark"
          onClick={addNode}
          className="toolBarButton addNodeButton">
          <BsNodePlus size={18} />
        </Button>
        {/* 調色盤，需要 handleClick */}
        <Button variant="dark" onClick={handleClick} className="toolBarButton">
          <BsPalette size={18} />
        </Button>
        <Menu
          // id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}>
          <MenuItem key="lines" onClick={() => changeBackground('lines')}>
            <AiOutlineBorderlessTable /> {translate('Lines')}
          </MenuItem>
          <MenuItem key="dots" onClick={() => changeBackground('dots')}>
            <BsDot /> {translate('Dots')}
          </MenuItem>
          <MenuItem key="cross" onClick={() => changeBackground('cross')}>
            <BiCross /> {translate('Cross')}
          </MenuItem>
        </Menu>
        <Button
          variant="dark"
          className="toolBarButton"
          onClick={handleNodeBarOpen}>
          <BsBookmarkHeart size={18} />
        </Button>
        <Button
          variant="dark"
          className="toolBarButton"
          onClick={openNodeContextMenu}
          disabled={isNodeSelected == null}>
          <AiOutlineEdit size={18} />
        </Button>
      </div>
      <div className="right">
        <Button
          variant="dark"
          onClick={() => setShow('ai')}
          className="toolBarButton Button">
          <InsightsIcon size={18} />
        </Button>
        <Button
          variant="dark"
          onClick={() => setShow('colab')}
          className="toolBarButton shareButton">
          <BsShare size={18} />
        </Button>
      </div>
      <Colabs // modal
        show={show == 'colab'}
        closeDialog={() => setShow('')}
        flowId={flowId}
        handleClose={handleClose}
      />
      <ChatBot // modal
        isShown={show == 'ai'}
        closeModal={() => setShow('')}
        handleClose={handleClose}
      />
    </nav>
  )
}
