import React from 'react'

import { useLanguage } from '../../providers/i18next'
import { Button, Dialog, DialogActions, DialogTitle } from '../Common/Mui.jsx'

type RemoveDialogProps = {
  isVisible: true
  setIsVisible: (isVisible: boolean) => void
  focus: number
  flows: IFlow[]
  submit: () => void
}

const RemoveDialog = ({
  isVisible,
  setIsVisible,
  focus,
  flows,
  submit
}: RemoveDialogProps) => {
  const { translate } = useLanguage()

  return (
    <Dialog open={isVisible} keepMounted onClose={() => setIsVisible(false)}>
      <DialogTitle>
        {translate('Do you want to delete the flow ') +
          flows[focus].title +
          '?'}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setIsVisible(false)}>
          {translate('Cancel')}
        </Button>
        <Button
          onClick={() => {
            submit()
            setIsVisible(false)
          }}>
          {translate('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RemoveDialog
