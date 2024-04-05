import './FlowEditor.scss'
import './ToolBar.scss'

import InsightsIcon from '@mui/icons-material/Insights'
import Button from '@mui/material/Button'
import React, { useState } from 'react'
import { BiFirstPage } from 'react-icons/bi'
import { BsBookmarkHeart, BsNodePlus, BsShare } from 'react-icons/bs'

import { useLanguage } from '../../providers/i18next'
import ChatBot from '../FlowTool/ChatBot'
import Colabs from '../FlowTool/Colabs'

export default function ToolBar({
  addNode,
  backToHome,
  flowId,
  handleNodeBarOpen
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

        <Button
          variant="dark"
          className="toolBarButton"
          onClick={handleNodeBarOpen}>
          <BsBookmarkHeart size={18} />
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
      <Colabs
        show={show == 'colab'}
        closeDialog={() => setShow('')}
        flowId={flowId}
        handleClose={handleClose}
      />
      <ChatBot
        show={show == 'ai'}
        closeDialog={() => setShow('')}
        flowId={flowId}
        handleClose={handleClose}
      />
    </nav>
  )
}
