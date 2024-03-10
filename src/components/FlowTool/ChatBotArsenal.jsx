import './ChatBotArsenal.scss'

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
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

    // optimisitic-ly 顯示進度
    setPulling((prev) => [
      ...prev,
      {
        name: id,
        total: undefined,
        completed: undefined,
        done: false,
      },
    ])
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

        // print(progress)

        setPulling(progress)
        if (progress.length < pulling.length) {
          // 條件成立, 代表有一個 model 已經下載完成了, 我們可以重整頁面
          fetchModels()
        }
        if (progress.length === 0) {
          console.log('下載好了！')
          // 全部都下載好後，除了會通過上面的條件，還需要另外再處理邏輯
          clearInterval(checkInterval)
          setIsPulling(false)
        }
      }, 1000)
    }

    // 無故離開該頁面, 也先清除該 Interval
    return () => clearInterval(checkInterval)
  }, [isPulling])

  const InstalledList = useMemo(() => {
    return models.installed.map((each, index) => {
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
          expanded={expanded === id}
          parameter_size={parameter_size}
          quantization_level={quantization_level}
          digest={digest}
          modified_at={modified_at}
          installed
          setExpanded={() => handleExpanded(id)}
        />
      )
    })
  }, [models, expanded])

  const UninstalledList = useMemo(() => {
    return models.uninstalled.map((each, index) => {
      const { id, name, description } = each
      const installing = pulling.reduce(
        // 如果 model 是正在 pulling 的，則回傳 true
        (acc, cur) => acc || cur.name === name,
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
    })
  }, [pulling, models, expanded])

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
        {InstalledList}
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
        {UninstalledList}
      </div>
      <div className="downloading">
        <div className="downloadTitle">Downloading</div>
        {pulling.map((each, index) => {
          const { name, total, completed, done } = each
          const percentage =
            !completed || !total ? 0 : (completed / total) * 100
          return (
            <div key={`pulling-model-${index}`} className="downloadBlock">
              <div className="title">{name}</div>
              <LinearProgressWithLabel value={percentage} />
            </div>
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
    if (installing || installingState) {
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
  }, [installingState, installing])

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

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  )
}

export default ChatBotArsenal
