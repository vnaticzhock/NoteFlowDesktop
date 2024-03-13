import React, { useEffect, useState } from 'react'

import { useLanguage } from '../../providers/i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
} from '../Common/Mui.jsx'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const RenameDialog = ({ isVisible, setIsVisible, flow, submit }) => {
  const { translate } = useLanguage()
  const [target, setTarget] = useState('')

  useEffect(() => {
    if (!isVisible) return
    setTarget(flow.title)
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
          onClick={(event) => {
            event.stopPropagation()
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(event) => {
            event.stopPropagation()
            setIsVisible(false)
          }}
        >
          {translate('Cancel')}
        </Button>
        <Button
          onClick={(event) => {
            event.stopPropagation()
            submit(flow.id, target)
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
