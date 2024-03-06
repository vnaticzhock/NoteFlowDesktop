import React, { useState, useRef, useEffect } from 'react'
import './FlowEditor.scss'
import Button from '@mui/material/Button'
import './ToolBar.scss'
import {
  BsDot,
  BsBookmarkHeart,
  BsNodePlus,
  BsShare,
  BsPalette,
} from 'react-icons/bs'
import { BiFirstPage, BiCross } from 'react-icons/bi'
import { AiOutlineBorderlessTable, AiOutlineEdit } from 'react-icons/ai'
import { Menu, MenuItem } from '@mui/material'
import Colabs from '../FlowTool/Colabs'
import { useLanguage } from '../../providers/i18next'
import InsightsIcon from '@mui/icons-material/Insights'
import ChatBot from '../FlowTool/ChatBot'

export default function ToolBar({
  addNode,
  backToHome,
  changeBackground,
  flowId,
  isNodeSelected,
  handleNodeBarOpen,
  openNodeContextMenu,
}) {
  const { translate } = useLanguage()
  const [show, setShow] = useState(false)
  // const { flowWebSocket, renewFlowWebSocket } = usePageTab()
  const [anchorEl, setAnchorEl] = useState(null)

  const open = Boolean(anchorEl)

  const handleClick = (event) => {
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
          className="toolBarButton lastPageButton"
        >
          <BiFirstPage size={18} />
        </Button>
      </div>
      <div className="mid">
        <Button
          variant="dark"
          onClick={addNode}
          className="toolBarButton addNodeButton"
        >
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
          onClose={handleClose}
        >
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
          onClick={handleNodeBarOpen}
        >
          <BsBookmarkHeart size={18} />
        </Button>
        <Button
          variant="dark"
          className="toolBarButton"
          onClick={openNodeContextMenu}
          disabled={isNodeSelected == null ? true : false}
        >
          <AiOutlineEdit size={18} />
        </Button>
      </div>
      <div className="right">
        <Button
          variant="dark"
          onClick={() => setShow('ai')}
          className="toolBarButton Button"
        >
          <InsightsIcon size={18} />
        </Button>
        <Button
          variant="dark"
          onClick={() => setShow('colab')}
          className="toolBarButton shareButton"
        >
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
        show={show == 'ai'}
        closeDialog={() => setShow('')}
        flowId={flowId}
        handleClose={handleClose}
      />
    </nav>
  )
}
