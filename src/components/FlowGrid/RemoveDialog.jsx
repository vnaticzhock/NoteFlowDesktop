import React, { useEffect, useState } from 'react'
import {
  Slide,
  Dialog,
  DialogTitle,
  Button,
  DialogActions,
} from '../Common/Mui.jsx'
import { useLanguage } from '../../providers/i18next'
import { Transition } from './FlowGrid.jsx'

const RemoveDialog = ({ isVisible, setIsVisible, focus, flows, submit }) => {
  const { translate } = useLanguage()

  return (
    <Dialog
      open={isVisible}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setIsVisible(false)}
    >
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
          }}
        >
          {translate('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RemoveDialog
