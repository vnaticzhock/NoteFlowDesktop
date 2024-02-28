import React, { useEffect, useState, useRef } from 'react'
import { experimentalStyled as styled } from '@mui/material/styles'
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
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useNavigate } from 'react-router-dom'
import { grey } from '@mui/material/colors'
import { useLanguage } from '../../providers/i18next'
import LoadingScreen from '../LoadingScreen/LoadingScreen'
import { fetchFlows } from '../../apis/APIs.jsx'
import './FlowGrid.scss'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function FlowGrid({ containerRef }) {
  const { translate } = useLanguage()

  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  // const [page, setPage] = useState(0)
  // 按右鍵的時候會出現的 menu
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 刪除 flow 會出現的警告
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  // 更改 flow 名稱時的警告
  const [isChangeTitleOpen, setIsChangeTitleOpen] = useState(false)

  const [focus, setFocus] = useState(null)

  const [target, setTarget] = useState(null)

  const navigateTo = useNavigate()
  const loadingCheckPointRef = useRef(null)
  const FlowButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(grey[100]),
    backgroundColor: 'white',
    border: '1px black solid',
    '&:hover': {
      backgroundColor: grey[100],
      border: '1px grey solid',
    },
    width: '100%',
    aspectRatio: '3/2',
  }))
  const options = {
    root: null,
    threshold: 0,
  }

  useEffect(() => {
    let page = 0
    setLoading(false)
    const observeforFetching = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          console.log('fetch')
          const res = await fetchFlows(page)
          setFlows([
            ...flows,
            ...res.sort((a, b) =>
              a.updateAt < b.updateAt ? 1 : a.updateAt > b.updateAt ? -1 : 0,
            ),
          ])
          page += 1
        }
      })
    }, options)
    let loadingCheckPointEle = loadingCheckPointRef.current
    if (loadingCheckPointEle) observeforFetching.observe(loadingCheckPointEle)
    console.log('loading', loadingCheckPointEle)

    return () => {
      let loadingCheckPointEle = loadingCheckPointRef.current
      if (loadingCheckPointEle) {
        observeforFetching.unobserve(loadingCheckPointEle)
      }
    }
  }, [loading])

  const toFlow = (flow) => {}

  const handleCloseContextMenu = (event) => {
    setTarget(null)
  }

  const deleteFlow = (id) => {}

  const changeTitle = (id, title) => {}

  // 長按功能
  const pressTimer = useRef(null)

  console.log('focus', focus)

  const startPress = (key, flow) => {
    pressTimer.current = setTimeout(() => {
      const div = document.querySelector(`#grid-item-${key}`)
      setTarget(div)
      setFocus({
        id: flow.id,
        title: flow.name,
      })
    }, 1000)
  }

  const cancelPress = () => {
    clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="flow-grid">
      {isAlertOpen || isChangeTitleOpen ? (
        isAlertOpen ? (
          <Dialog
            open={isAlertOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setIsAlertOpen(false)}
          >
            <DialogTitle>
              {translate('Do you want to delete the flow ') + focus.title + '?'}
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setIsAlertOpen(false)}>
                {translate('Cancel')}
              </Button>
              <Button
                onClick={() => {
                  deleteFlow(focus.id)
                  setIsAlertOpen(false)
                }}
              >
                {translate('Confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        ) : (
          <Dialog
            open={isChangeTitleOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setIsChangeTitleOpen(false)}
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
                value={focus.title}
                onChange={(event) => {
                  setFocus((state) => {
                    state.title = event.target.value
                    return JSON.parse(JSON.stringify(state))
                  })
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsChangeTitleOpen(false)}>
                {translate('Cancel')}
              </Button>
              <Button
                onClick={() => {
                  changeTitle(focus.id, focus.title)
                  setIsChangeTitleOpen(false)
                }}
              >
                {translate('Confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        )
      ) : (
        <div className="flow-container">
          {flows.map((flow, key) => {
            const date = new Date()
            date.setTime(flow.updateAt)
            const formattedDate = date.toLocaleString()
            return (
              <div
                className="grid-item"
                onContextMenu={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  if (event.currentTarget === target) {
                    setTarget(null)
                    setFocus(null)
                  } else {
                    setTarget(event.currentTarget)
                    setFocus({
                      id: flow.id,
                      title: flow.name,
                    })
                  }

                  // setIsMenuOpen((prev) => !prev);
                }}
                onTouchStart={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  startPress(key, flow)
                }}
                onTouchEnd={cancelPress}
                id={`grid-item-${key}`}
                key={key}
              >
                <FlowButton
                  onClick={() => toFlow(flow)}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                >
                  {flow.thumbnail !== '' ? (
                    <img
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                      alt="flow.thumbnail"
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography>{translate('Last Edit Time:')}</Typography>
                      <Typography>{formattedDate}</Typography>
                    </div>
                  )}
                </FlowButton>
                <Typography>{flow.name}</Typography>
                <ClickAwayListener
                  onClickAway={handleCloseContextMenu}
                  key={key}
                >
                  <Menu
                    // autoFocusItem={open}
                    open={!!target}
                    anchorEl={target}
                    anchorOrigin={{
                      vertical: 'center',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    style={
                      {
                        // border: '1px solid red',
                      }
                    }
                  >
                    <MenuItem
                      onClick={() => {
                        console.log('open!')
                        setIsChangeTitleOpen(true)
                      }}
                      onTouchStart={() => {
                        setIsChangeTitleOpen(true)
                      }}
                    >
                      {translate('Rename')}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setIsAlertOpen(true)
                      }}
                      onTouchStart={() => {
                        setIsAlertOpen(true)
                      }}
                    >
                      {translate('Delete')}
                    </MenuItem>
                  </Menu>
                </ClickAwayListener>
              </div>
            )
          })}
          {containerRef?.current && (
            <></>
            // <BackToTopButton containerRef={containerRef} />
          )}
        </div>
      )}
      <ClickAwayListener onClickAway={handleCloseContextMenu} key={-1}>
        <Menu
          // autoFocusItem={open}
          open={true}
          anchorEl={target}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          style={{
            display: 'none',
          }}
        ></Menu>
      </ClickAwayListener>
      <div className="loading-checkpoint" ref={loadingCheckPointRef}>
        CHECKPOINT
      </div>
    </div>
  )
}
