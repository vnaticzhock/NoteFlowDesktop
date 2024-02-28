import React, { useState, useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ListItem from '@mui/material/ListItem'
import Box from '@mui/material/Box'
// import instance from '../../API/api'
import './FlowEditor.scss'
import { useLanguage } from '../../providers/i18next'
import { Divider } from '@mui/material'

export default function NodeBar({ handleNodeBarClose, setDragNode }) {
  const { translate } = useLanguage()
  const [nodes, setNodes] = useState([])

  const onDragStart = (event, node, type) => {
    event.dataTransfer.setData('application/reactflow', type)
    event.dataTransfer.effectAllowed = 'move'
    setDragNode(node)
  }
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
  return (
    <Box className="bar">
      <Drawer
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
          },
        }}
        variant="persistent"
        anchor="right"
        open={true}
      >
        <List>
          <ListItem sx={{ fontSize: '20px', marginBottom: '10px' }}>
            <IconButton onClick={handleNodeBarClose}>
              <ChevronLeftIcon />
            </IconButton>{' '}
            {translate('Library Nodes')}
          </ListItem>

          {nodes.map((node) => {
            const editTime = getTime(node.updateAt)
            return (
              <div className="nodebar-item" key={node.id}>
                <ListItem sx={{ justifyContent: 'center' }}>
                  <div
                    className="drag-node"
                    onDragStart={(event) =>
                      onDragStart(event, node, 'CustomType')
                    }
                    draggable
                  >
                    <p>{node.name}</p>
                  </div>
                </ListItem>
                <ListItem sx={{ justifyContent: 'center', fontSize: '12px' }}>
                  <p>
                    {translate('Last Edit Time:')} {editTime.time}
                    {' ' + translate(editTime.unit) + translate('ago')}
                  </p>
                </ListItem>
              </div>
            )
          })}
          <Divider />
        </List>
      </Drawer>
    </Box>
  )
}
