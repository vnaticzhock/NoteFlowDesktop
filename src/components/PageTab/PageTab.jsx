import React, { useState, useEffect } from 'react'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import {
  Button,
  IconButton,
  ButtonGroup,
  Typography,
  Toolbar,
} from '../Common/Mui.jsx'
import { HomeIcon, PlusIcon, DeleteIcon } from '../Common/ReactIcon'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { FaPen, FaBook } from 'react-icons/fa'
import { createFlow } from '../../apis/APIs.jsx'
import './PageTab.scss'

export default function PageTab({ tabList, setTabList, toFlow, activeTab }) {
  const [isHovered, setIsHovered] = useState(false)

  const navigate = useNavigate()

  const TabButton = styled(Button)(({ theme }) => ({
    border: '1px solid white',
    paddingRight: '20%',
    '&:hover': {
      backgroundColor: 'white',
      '& > icon': {
        color: 'black',
      },
      '& > p': {
        color: 'black',
      },
    },
    width: 130,
    height: 35,
  }))

  const CloseButton = styled(Button)(({ theme }) => ({
    border: '1px solid white',
    borderLeft: '0',
    '&:hover': {
      backgroundColor: 'white',
    },
    width: 40,
    height: 35,
  }))

  const backToHome = () => navigate('/')
  const addNewFlow = async () => toFlow(await createFlow())
  const removeTab = async (id) => {
    setTabList((tabs) => {
      return tabs.filter((tab) => tab.id !== id)
    })
    backToHome()
  }

  return (
    <>
      {/* {changeTab && <Navigate to="/flow" state={{ flowNow }}/>} */}
      <Toolbar
        sx={{
          backgroundColor: 'black',
          paddingBottom: 0,
          height: '5%',
          // maxHeight: '7%',
          overflowX: 'scroll',
        }}
        className="toolbar"
        direction="row"
        spacing={2}
      >
        <IconButton
          size="medium"
          onClick={backToHome}
          style={{ marginRight: '10px' }}
        >
          <HomeIcon color="white" size={20} />
        </IconButton>
        <Stack direction="row" spacing={1}>
          {tabList.map((tab, i) => {
            let tabTitle = tab.title
            const leng = 10
            if (tabTitle?.length > leng) {
              tabTitle = tabTitle.substring(0, leng - 1) + '...'
            }

            return (
              <ButtonGroup color="primary" variant="outlined" key={i}>
                <TabButton
                  className="singleTab"
                  onClick={() => toFlow(tab)}
                  style={{
                    backgroundColor: tab.id == activeTab && '#ffffff',
                    position: 'relative',
                    width: '150px',
                  }}
                >
                  <Typography
                    color={tab.id == activeTab ? 'black' : 'white'}
                    style={{
                      height: '100%',
                      overflow: 'hidden',
                      fontSize: '15px',
                    }}
                  >
                    {tabTitle}
                  </Typography>
                  <div
                    className="tabIcon"
                    style={{
                      position: 'absolute',
                      top: '20%',
                      right: '8%',
                      padding: 0,
                      margin: 0,
                      color: tab.id === activeTab ? 'black' : '',
                    }}
                  >
                    {tab.type == 'node' ? <FaBook /> : <FaPen />}
                  </div>
                </TabButton>
                <CloseButton
                  size="small"
                  style={{
                    backgroundColor: tab.id == activeTab && '#ffffff',
                  }}
                  className="crossTab"
                  onClick={() => removeTab(tab.id)}
                >
                  <DeleteIcon
                    color={tab.id == activeTab ? 'black' : 'white'}
                    className="cross"
                    size={15}
                  />
                </CloseButton>
              </ButtonGroup>
            )
          })}
        </Stack>
        <IconButton size="medium" onClick={addNewFlow}>
          <PlusIcon color="white" size={15} />
        </IconButton>
      </Toolbar>
    </>
  )
}
