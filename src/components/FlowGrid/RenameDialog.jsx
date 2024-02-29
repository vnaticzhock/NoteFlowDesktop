import React, { useEffect, useState } from 'react'
import {
  Slide,
  Dialog,
  DialogTitle,
  Button,
  Menu,
  Typography,
  MenuItem,
  DialogContent,
  TextField,
  DialogActions,
} from '../Common/Mui.jsx'
import { useLanguage } from '../../providers/i18next'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const RenameDialog = ({ isVisible, setIsVisible, focus, flows, submit }) => {
  const { translate } = useLanguage()
  const [target, setTarget] = useState('')

  useEffect(() => {
    if (!isVisible) return
    setTarget(flows[focus].title)
  }, [isVisible])

  return (
    <Dialog
      open={isVisible}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setIsVisible(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{translate('Change Name')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          variant="standard"
          label={translate('Flow Name')}
          multiline
          value={target}
          onChange={(event) => {
            setTarget(event.target.value)
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsVisible(false)}>
          {translate('Cancel')}
        </Button>
        <Button
          onClick={() => {
            submit({
              id: flows[focus].id,
              title: target,
            })
            setIsVisible(false)
          }}
        >
          {translate('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RenameDialog