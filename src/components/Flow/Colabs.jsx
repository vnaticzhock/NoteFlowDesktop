import React, { useEffect, useState } from 'react'
import {
  Modal,
  Backdrop,
  Box,
  Fade,
  Button,
  TextField,
  List,
  ListSubheader,
} from '@mui/material'
import { ListItemComponent, ListComponent } from '../Common/Mui'
import DraftsIcon from '@mui/icons-material/Drafts'
import InboxIcon from '@mui/icons-material/Inbox'
import CloseIcon from '@mui/icons-material/Close'
import WavesIcon from '@mui/icons-material/Waves'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import './Colabs.scss'
// import instance from '../../API/api'
import { useLanguage } from '../../providers/i18next'
// import { useApp } from '../../hooks/useApp'

export default function Colabs({ show, setShow, handleClose, flowId }) {
  const { translate } = useLanguage()
  const [allColabs, setAllColabs] = useState(null)
  const [rerender, setRerender] = useState(false)
  const [colabInput, setColabInput] = useState('')
  const [alarms, setAlarms] = useState('')
  // const { user } = useApp()

  const handleSubmit = () => {
    setShow(false)
  }

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
        <Box className="modalContent">
          <div className="headerHolder">
            <h2 className="title">{translate('Settings')}</h2>
            <Button
              disableRipple
              size="medium"
              variant="contained"
              sx={{
                margin: '0 15px 0 0',
                backgroundColor: '#f6f6f6',
                color: 'black',
                maxHeight: '35px',
                '&:hover': {
                  backgroundColor: '#f6f6f6',
                  border: '#f3f3f solid 1px',
                },
              }}
              disableElevation={true}
              onClick={handleSubmit}
            >
              Close
            </Button>
          </div>
          <div className="workspace">
            <div>
              <ListComponent
                subtitle={'Flow'}
                listItems={[
                  { icon: WavesIcon, text: translate('Flow') },
                  { icon: GroupAddIcon, text: translate('Colab') },
                ]}
              />
              <ListComponent
                subtitle={'Personal'}
                listItems={[{ icon: InboxIcon, text: translate('Settings') }]}
              />
            </div>
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
              {translate('Update')}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}
