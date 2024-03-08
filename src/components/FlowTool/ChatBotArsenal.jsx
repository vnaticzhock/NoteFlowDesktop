import './ChatBotArsenal.scss'

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getModelList,
  getPullingProgress,
  isPullingModel,
  pullModel,
} from '../../apis/APIs'

const ChatBotArsenal = () => {
  const [expanded, setExpanded] = useState(null)
  const [models, setModels] = useState({
    installed: [],
    uninstalled: [],
  })
  const [isPulling, setIsPulling] = useState(false)
  const [pulling, setPulling] = useState([])

  const fetchModels = () => {
    getModelList().then((res) => {
      const { installed, uninstalled } = res
      setModels({ installed, uninstalled })
    })
  }

  const checkIsPulling = () => {
    isPullingModel().then((res) => {
      if (res) {
        // 條件成立後才設定為 true, 可以少一次的 render
        setIsPulling(true)
      }
    })
  }

  const handleInstall = async (id) => {
    await pullModel(id)
    checkIsPulling()
  }

  const handleExpanded = useCallback(
    (id) => {
      if (expanded === id) {
        // 按第二次同樣的按鍵則跳回主頁面
        setExpanded(null)
      } else {
        setExpanded(id)
      }
    },
    [expanded],
  )

  useEffect(() => {
    fetchModels()
    checkIsPulling()
  }, [])

  useEffect(() => {
    let checkInterval

    // 確認正在 Pulling model 之後觸發一個 interval, 定期確認進度
    if (isPulling) {
      checkInterval = setInterval(async () => {
        const progress = await getPullingProgress()
        console.log('progress:', progress)

        setPulling(progress)
        if (progress.length < pulling.length) {
          // 條件成立, 代表有一個 model 已經下載完成了, 我們可以重整頁面
          fetchModels()
        }
        if (progress.length === 0) {
          clearInterval(checkInterval)
          setIsPulling(false)
        }
      }, 1000)
    }

    // 無故離開該頁面, 也先清除該 Interval
    return () => clearInterval(checkInterval)
  }, [isPulling])

  return (
    <div className="arsenalWindow">
      <div className="accordionList">
        {models.installed.length !== 0 ? (
          <Typography
            variant="h4"
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
          >
            已安裝
          </Typography>
        ) : (
          <></>
        )}
        {models.installed.map((each, index) => {
          const {
            id,
            name,
            description,
            parameter_size,
            quantization_level,
            digest,
            modified_at,
          } = each
          return (
            <ModelComponent
              key={`accordion-${id}`}
              id={id}
              name={name}
              description={description}
              expanded={expanded}
              parameter_size={parameter_size}
              quantization_level={quantization_level}
              digest={digest}
              modified_at={modified_at}
              installed
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
        {models.uninstalled.length !== 0 ? (
          <Typography
            variant="h4"
            style={{ paddingTop: '30px', paddingBottom: '10px' }}
          >
            未安裝
          </Typography>
        ) : (
          <></>
        )}
        {models.uninstalled.map((each, index) => {
          const { id, name, description } = each
          const installing = pulling.reduce(
            // 如果 model 是正在 pulling 的，則回傳 true
            (acc, cur) => acc && cur[0] === name,
            false,
          )

          return (
            <ModelComponent
              key={`accordion-${id}`}
              name={name}
              description={description}
              expanded={expanded === id}
              install={() => handleInstall(id)}
              installing={installing}
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
      </div>
    </div>
  )
}

const ModelComponent = ({
  name,
  description,
  expanded,
  setExpanded,
  installed,
  installing,
  install,
  parameter_size,
  quantization_level,
  digest,
  modified_at,
}) => {
  // optimistic-ly 修改狀態
  const [installingState, setInstallingState] = useState(installing)

  const AdequateIcon = useMemo(() => {
    if (installingState) {
      return <CircularProgress size={'20px'} sx={{ color: 'text.secondary' }} />
    }
    if (!installed) {
      return (
        <InstallDesktopIcon
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            setInstallingState(true)
            install()
          }}
        />
      )
    }
    return <></>
  }, [installingState])

  return (
    <Accordion
      expanded={expanded}
      style={{ boxShadow: 'none' }}
      sx={{
        '&:before': {
          display: 'none',
        },
        borderBottom: '1px solid #dddddd',
      }}
    >
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon onClick={setExpanded} />}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h5"
          sx={{ width: installed ? '100%' : '92%', fontWeight: 600 }}
          onClick={setExpanded}
        >
          {name}
        </Typography>
        {AdequateIcon}
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ width: '100%' }}>{description}</Typography>
        {installed ? (
          <>
            <div>Parameters: </div>
            <div>{parameter_size}</div>
            <div>{quantization_level}</div>
            <div>{digest}</div>
            <div>{modified_at}</div>
          </>
        ) : (
          <></>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default ChatBotArsenal
