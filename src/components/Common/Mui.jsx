import React from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase'
import ButtonGroup from '@mui/material/ButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material'

const ListComponent = ({ subtitle, listItems }) => {
  return (
    <List
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {subtitle}
        </ListSubheader>
      }
    >
      {listItems.map((each, i) => {
        const { icon, text } = each
        return <ListItemComponent key={i} IconComponent={icon} text={text} />
      })}
    </List>
  )
}

const ListItemComponent = ({ IconComponent, text }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton disableRipple>
        <ListItemIcon>
          <IconComponent />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  )
}

export {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputBase,
  Link,
  ListComponent,
  ListItemComponent,
  Menu,
  MenuItem,
  SearchIcon,
  Slide,
  TextField,
  Toolbar,
  Typography,
}
