import React from 'react'
import { useLanguage } from '../../providers/i18next.jsx'
import { Editor } from '../Editor/Editor'
import { useState, useEffect } from 'react'
import { styled, alpha } from '@mui/material/styles'
import { grey } from '@mui/material/colors'
import {
  SearchIcon,
  Grid,
  Typography,
  Button,
  InputBase,
} from '../Common/Mui.jsx'

const Library = () => {
  const { translate } = useLanguage()
  // const { changeMode } = useParams()
  // const { isMobile } = useApp()
  const [nodes, setNodes] = useState([])
  const [editorId, setEditorId] = useState(null)
  const [query, setQuery] = useState('')
  const [intervalId, setIntervalId] = useState(null)
  //用這個控制 mobile 時候 editor 要不要顯示，顯示的時候隱藏 search 跟 nodes
  const [mobileEditorDisplay, setMobileEditorDisplay] = useState(false)

  const NodeButton = styled(Button)(({ theme, selected }) => ({
    color: theme.palette.getContrastText(grey[100]),
    fontSize: '12px',
    backgroundColor: selected ? '#E0E0E0' : 'white',
    borderRadius: selected ? '5px' : '0',
    '&:hover': {
      backgroundColor: selected ? '#E0E0E0' : grey[100],
    },
    width: '90%',
    height: 70,
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '95%',
      height: '1px',
      backgroundColor: '#E0E0E0',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }))
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '0',
    '&:hover': {
      backgroundColor: grey[100],
    },
    width: '90%',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '95%',
      height: '1px',
      backgroundColor: '#E0E0E0',
    },
  }))
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }))
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  }))

  const toNode = (id) => {
    setEditorId(id)
  }
  const getNodes = (flag) => {}

  const createInterval = () => {
    const interval = setInterval(() => {
      getNodes(1)
    }, 2000)
    setIntervalId(interval)
  }
  useEffect(() => {
    if (intervalId === null) {
      getNodes(0)
      createInterval()
    } else if (intervalId === '') {
      createInterval()
    }
    return () => {
      clearInterval(intervalId)
    }
  }, [intervalId])

  const getTime = (time) => {
    const now = new Date()
    const timeDiff = now - time
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor(timeDiff / (1000 * 60))
    if (days >= 1) {
      return { time: days, unit: days === 1 ? 'day' : 'days' }
    } else if (hours >= 1) {
      return { time: hours, unit: hours === 1 ? 'hour' : 'hours' }
    } else {
      return { time: minutes, unit: minutes <= 1 ? 'minute' : 'minutes' }
    }
  }

  const search = (key, query) => {
    if (key === 'Enter') {
      setQuery(query)
      const tempList = nodes.filter((node) => {
        if (query === '') {
          return true
        }
        return node.name.includes(query)
      })
      if (tempList.length > 0) {
        setEditorId(tempList[0].id)
      }
      setIntervalId('')
    }
  }
  return (
    <Grid container columns={12} sx={{ height: '100%' }}>
      <Grid
        item
        md={2}
        xs={12}
        sx={{
          // borderRight: "1px solid lightgrey",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'top',
          alignItems: 'center',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={translate('Search...')}
            inputProps={{ 'aria-label': 'search' }}
            onFocus={() => clearInterval(intervalId)}
            onBlur={() => setIntervalId('')}
            onKeyDown={(e) => search(e.key, e.target.value)}
          />
        </Search>
        {nodes
          .filter((node) => {
            if (query === '') {
              return true
            }
            return node.name.includes(query)
          })
          .map((node) => {
            const editTime = getTime(node.updateAt)
            return (
              <NodeButton
                className="node-button"
                onClick={() => {
                  toNode(node.id)
                }}
                key={node.id}
                selected={node.id === editorId}
              >
                <Typography sx={{ fontSize: '12px' }}>{node.name}</Typography>
                <Typography sx={{ fontSize: '12px' }}>
                  {translate('Last Edit Time:')} {editTime.time}
                  {' ' + translate(editTime.unit) + translate('ago')}
                </Typography>
              </NodeButton>
            )
          })}
      </Grid>{' '}
      <Grid
        item
        md={10}
        style={{
          height: '100%',
          display: 'flex',
        }}
      >
        {nodes.filter((node) => {
          if (query === '') {
            return true
          }
          return node.name.includes(query)
        }).length === 0 ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F0F0F0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={() => {}}
            >
              {translate('Add nodes to library now!')}
            </Typography>
          </div>
        ) : (
          <Editor
            editorId={editorId}
            handleDrawerClose={() => {
              setMobileEditorDisplay(false)
            }}
          />
        )}
      </Grid>
    </Grid>
  )
}
export default Library
