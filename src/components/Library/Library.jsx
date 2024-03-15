import { grey } from '@mui/material/colors'
import { alpha, styled } from '@mui/material/styles'
import React, { useCallback, useMemo } from 'react'
import { useEffect, useState } from 'react'

import { fetchFavoriteNodes } from '../../apis/APIs.jsx'
import { useLanguage } from '../../providers/i18next.jsx'
import {
  Button,
  Grid,
  InputBase,
  SearchIcon,
  Typography,
} from '../Common/Mui.jsx'
import { Editor } from '../Editor/Editor'

const Library = () => {
  const { translate } = useLanguage()

  const [nodes, setNodes] = useState([])
  const [editorId, setEditorId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchFavoriteNodes().then((res) => {
      setNodes(res)
    })
  }, [])

  const editingNodeCallback = useCallback(
    (id, data) => {
      setNodes((prev) => {
        return prev.map((each, index) => {
          const current = new Date()
          if (each.id === id) {
            each = {
              ...each,
              ...data,
            }
          }
          return each
        })
      })
    },
    [nodes],
  )

  const getTime = (time) => {
    const now = new Date()
    now.setHours(now.getHours() - 8)
    time = new Date(time)

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
        return node.title.includes(query)
      })
      if (tempList.length > 0) {
        setEditorId(tempList[0].id)
      }
    }
  }

  const MenuList = useMemo(() => {
    return nodes
      .filter((node) => {
        if (query === '') {
          return true
        }
        return node.title.includes(query)
      })
      .map((node) => {
        const editTime = getTime(node.update_time)
        console.log('node!', node)
        return (
          <NodeButton
            className="node-button"
            onClick={() => {
              setEditorId(node.id)
            }}
            key={node.id}
            selected={node.id === editorId}
          >
            <Typography sx={{ fontSize: '12px' }}>{node.title}</Typography>
            <Typography sx={{ fontSize: '12px' }}>
              {translate('Last Edit Time:')} {editTime.time}
              {' ' + translate(editTime.unit) + translate('ago')}
            </Typography>
          </NodeButton>
        )
      })
  }, [nodes])

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
            onKeyDown={(e) => search(e.key, e.target.value)}
          />
        </Search>
        {MenuList}
      </Grid>{' '}
      <Grid
        item
        md={10}
        style={{
          height: '100%',
          display: 'flex',
        }}
      >
        {!editorId ||
        nodes.filter((node) => {
          if (query === '') {
            return true
          }
          return node.title.includes(query)
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
              {translate('Click an existing node or add nodes to library now!')}
            </Typography>
          </div>
        ) : (
          <Editor
            editorId={editorId}
            atLibrary
            libraryNodeCallback={editingNodeCallback}
          />
        )}
      </Grid>
    </Grid>
  )
}

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

export default Library
