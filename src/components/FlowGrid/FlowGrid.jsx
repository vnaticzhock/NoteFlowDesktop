import ClickAwayListener from '@mui/material/ClickAwayListener'
import { grey } from '@mui/material/colors'
import { experimentalStyled as styled } from '@mui/material/styles'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { deleteFlow, editFlowTitle, fetchFlows } from '../../apis/APIs.jsx'
import { useLanguage } from '../../providers/i18next'
import { Button, Menu, MenuItem, Slide, Typography } from '../Common/Mui.jsx'
import LoadingScreen from '../LoadingScreen/LoadingScreen'
import BackToTopButton from './BackToTopButton.jsx'
import './FlowGrid.scss'
import RemoveDialog from './RemoveDialog.jsx'
import RenameDialog from './RenameDialog.jsx'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function FlowGrid({ containerRef }) {
  const { toFlow, editPageTab } = useOutletContext()
  const { translate } = useLanguage()

  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isChangeTitleOpen, setIsChangeTitleOpen] = useState(false)

  const [focus, setFocus] = useState(-1)

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
          const res = await fetchFlows(page)
          console.log(res)
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

    return () => {
      let loadingCheckPointEle = loadingCheckPointRef.current
      if (loadingCheckPointEle) {
        observeforFetching.unobserve(loadingCheckPointEle)
      }
    }
  }, [loading])

  const handleCloseContextMenu = (event) => {
    setTarget(null)
  }

  const removeFlow = () => {
    const focusFlowId = flows[focus].id
    deleteFlow(focusFlowId)
    setFlows((data) => data.filter((each) => each.id != focusFlowId))
  }

  const changeFlowTitle = (target) => {
    editFlowTitle(target.id, target.title)
    setFlows((data) => {
      data[focus].title = target.title
      editPageTab(data[focus].id, target.title)
      return data
    })
  }

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="flow-grid">
      {isAlertOpen || isChangeTitleOpen ? (
        isAlertOpen ? (
          <RemoveDialog
            isVisible={isAlertOpen}
            setIsVisible={setIsAlertOpen}
            focus={focus}
            flows={flows}
            submit={removeFlow}
          />
        ) : (
          <RenameDialog
            isVisible={isChangeTitleOpen}
            setIsVisible={setIsChangeTitleOpen}
            focus={focus}
            flows={flows}
            submit={changeFlowTitle}
          />
        )
      ) : (
        <div className="flow-container">
          {flows.map((flow, i) => {
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
                    setFocus(i)
                  }
                  // setIsMenuOpen((prev) => !prev);
                }}
                id={`grid-item-${i}`}
                key={i}
              >
                <FlowButton
                  onClick={() => {
                    toFlow(flow)
                  }}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                >
                  <img
                    src={flow.thumbnail}
                    style={{
                      objectFit: 'cover',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                    }}
                    loading="lazy"
                  />
                </FlowButton>
                <Typography>{flow.title}</Typography>
                <ClickAwayListener onClickAway={handleCloseContextMenu} key={i}>
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
                    >
                      {translate('Rename')}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
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
            <BackToTopButton containerRef={containerRef} />
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

export { Transition }
