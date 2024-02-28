import React, { useEffect, useState } from 'react'
import { Modal, Backdrop, Box, Fade, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import './Colabs.scss'
// import instance from '../../API/api'
import { useTranslation } from 'react-i18next'
// import { useApp } from '../../hooks/useApp'

export default function Colabs({ show, setShow, handleClose, flowId }) {
  const { t } = useTranslation()
  const [allColabs, setAllColabs] = useState(null)
  const [rerender, setRerender] = useState(false)
  const [colabInput, setColabInput] = useState('')
  const [alarms, setAlarms] = useState('')
  // const { user } = useApp()

  const handleSubmit = async () => {}

  useEffect(() => {
    if (allColabs) {
      allColabs.forEach((data, index) => {
        const each = document.querySelector(`#colab-${index}`)
        if (each) {
          if (data.status === 200) {
            each.style.border = undefined
          } else {
            each.style.border = '1px solid red'
          }
        }
      })
    }
  }, [allColabs])

  return (
    <Modal
      className="styled-modal"
      open={show}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={show}>
        <Box className="modal-content">
          {allColabs === null ? (
            <h2>{t('Loading...')}</h2>
          ) : (
            <h2>{t('User list')}</h2>
          )}
          <TextField
            margin="normal"
            // required
            fullWidth
            multiline
            name="colabs"
            label=""
            type="text"
            id="colabs"
            size="small"
            value={colabInput}
            onChange={(e) => {
              setColabInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setAllColabs((state) => [
                  ...state,
                  { email: colabInput, type: 'new', status: 200 },
                ])
                setColabInput('')
              }
            }}
            InputProps={{
              style: {
                display: 'flex',
                flexWrap: 'wrap',
              },
              startAdornment:
                allColabs === null
                  ? undefined
                  : allColabs.map((data, index) => {
                      return data.type === 'remove' ? (
                        <></>
                      ) : (
                        <div
                          id={`colab-${index}`}
                          key={`colab-${index}`}
                          className="colab-tags"
                        >
                          {data.email}
                          {data.email !== 'user.email' && (
                            <div
                              onClick={() => {
                                setAllColabs((state) => {
                                  // 如果是 new，可以直接 filter 掉，
                                  if (state[index].type === 'new') {
                                    return state.filter((d, i) => i !== index)
                                  }
                                  state[index].type = 'remove'
                                  return state
                                })
                                setRerender((state) => !state)
                              }}
                            >
                              <CloseIcon />
                            </div>
                          )}
                        </div>
                      )
                    }),
            }}
          />
          <div
            style={{
              color: 'red',
              height: '18px',
              // border: '1px solid black',
              textAlign: 'left',
              padding: '0 5px 0 5px',
            }}
          >
            {alarms}
          </div>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
            style={{
              backgroundColor: '#0e1111',
              color: 'white',
              paddingTop: '2%',
              textTransform: 'none',
            }}
          >
            {t('Update')}
          </Button>
        </Box>
      </Fade>
    </Modal>
  )
}
