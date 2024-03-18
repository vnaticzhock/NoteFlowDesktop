import React, { useEffect, useState } from 'react'

import { useLanguage } from '../../providers/i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField
} from '../Common/Mui.jsx'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

type RenameDialogProps = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  flow: iFlow | null
  submit: (flowId: string, newTitle: string) => void
}

const RenameDialog = ({
  isVisible,
  setIsVisible,
  flow,
  submit
}: RenameDialogProps) => {
  const { translate } = useLanguage()
  const [target, setTarget] = useState<string>('')

  useEffect(() => {
    if (!isVisible || flow === null) return
    setTarget(flow.title)
  }, [isVisible])

  return (
    <Dialog
      open={isVisible}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setIsVisible(false)}
      fullWidth
      maxWidth="sm">
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
          onChange={(event: KeyboardEvent) => {
            if (event.target === null) return
            setTarget((event.target as HTMLInputElement).value)
          }}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            setIsVisible(false)
          }}>
          {translate('Cancel')}
        </Button>
        <Button
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            if (flow === null) return
            submit(flow.id, target)
            setIsVisible(false)
          }}>
          {translate('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RenameDialog
