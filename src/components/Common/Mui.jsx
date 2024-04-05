import SearchIcon from '@mui/icons-material/Search'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader
} from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Slide from '@mui/material/Slide'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import React from 'react'

const ListComponent = ({ subtitle, listItems, sx, selected }) => {
  return (
    <List
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {subtitle}
        </ListSubheader>
      }
      sx={sx}>
      {listItems.map((each, i) => {
        const { id, icon, text, onClick } = each
        return (
          <ListItemComponent
            isSelected={id === selected}
            key={i}
            IconComponent={icon}
            text={text}
            onClick={onClick}
          />
        )
      })}
    </List>
  )
}

const ListItemComponent = ({
  id,
  IconComponent,
  text,
  onClick,
  isSelected
}) => {
  return (
    <ListItem
      // sx={{ borderRadius: '1.125rem' }}
      disablePadding
      onClick={onClick}
      selected={isSelected}>
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
  Typography
}
