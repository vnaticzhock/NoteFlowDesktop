import './ChatBotArsenal.scss'

import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Input from '@mui/material/Input'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Radio from '@mui/material/Radio'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  addChatGPTApiKey,
  getApiKeys,
  getModelList,
  getPullingProgress,
  isPullingModel,
  pullModel,
  removeChatGPTApiKey,
  updateChatGPTDefaultApiKey
} from '../../apis/APIs'

const ChatBotArsenal = ({ isOllama }) => {
  const [expanded, setExpanded] = useState(null)
  const [models, setModels] = useState({
    installed: [],
    uninstalled: []
  })
  const [isPulling, setIsPulling] = useState(false)
  const [pulling, setPulling] = useState([])
  const [loaded, setLoaded] = useState(false)

  // Ollama 是否安裝
  const OllamaTips = useMemo(() => {
    if (isOllama) return <></>
    return (
      <>
        <div className="ollama-uninstall noselect">
          Do not detect Ollama working in your environment.
        </div>
      </>
    )
  }, [isOllama])

  // Ollama 下載邏輯
  const fetchModels = () => {
    getModelList().then(res => {
      const { installed, uninstalled } = res
      setModels({ installed, uninstalled })
      setLoaded(true)
    })
  }

  const checkIsPulling = () => {
    isPullingModel().then(res => {
      if (res) {
        // 條件成立後才設定為 true, 可以少一次的 render
        setIsPulling(true)
      }
    })
  }

  const handleInstall = async id => {
    await pullModel(id)
    checkIsPulling()

    // optimisitic-ly 顯示進度
    setPulling(prev => [
      ...prev,
      {
        name: id,
        total: undefined,
        completed: undefined,
        done: false
      }
    ])
  }

  const handleExpanded = useCallback(
    id => {
      if (expanded === id) {
        // 按第二次同樣的按鍵則跳回主頁面
        setExpanded(null)
      } else {
        setExpanded(id)
      }
    },
    [expanded]
  )

  useEffect(() => {
    if (isOllama) {
      fetchModels()
      checkIsPulling()
    }
  }, [isOllama])

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
    return models.installed.length !== 0 ? (
      <>
        <Typography
          variant="h4"
          fontFamily={`'Courier New', Courier, monospace`}
          style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          Installed
        </Typography>
        {models.installed.map((each, index) => {
          const {
            id,
            name,
            description,
            parameter_size,
            quantization_level,
            digest,
            modified_at
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
        })}
      </>
    ) : (
      <></>
    )
  }, [models, expanded])

  const UninstalledList = useMemo(() => {
    return models.uninstalled.length !== 0 ? (
      <>
        <Typography
          variant="h4"
          fontFamily={`'Courier New', Courier, monospace`}
          style={{ paddingTop: '30px', paddingBottom: '10px' }}>
          Uninstalled
        </Typography>
        {models.uninstalled.map((each, index) => {
          const { id, name, description } = each
          const installing = pulling.reduce(
            // 如果 model 是正在 pulling 的，則回傳 true
            (acc, cur) => acc || cur.name === name,
            false
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
      </>
    ) : (
      <></>
    )
  }, [pulling, models, expanded])

  // ChatGPT 邏輯

  const [apiKeys, setApiKeys] = useState([])
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleAddApiKeyClick = () => {
    setIsAddingKey(true)
  }

  const handleSubmitApiKey = () => {
    addChatGPTApiKey(inputValue)
    if (apiKeys.length === 0) {
      updateChatGPTDefaultApiKey(inputValue)
      setDefaultApiKey(inputValue)
    }
    setApiKeys(prev => [...prev, inputValue])
    setInputValue('')
    setIsAddingKey(false)
  }

  const handleApiKeyRemoving = idx => {
    const key = apiKeys[idx]
    removeChatGPTApiKey(key)
    if (key === defaultApiKey) {
      // 設定新的 default api key，先設定為空白，也就是不一定要有 default api key
      updateChatGPTDefaultApiKey('')
    }
    setApiKeys(prev => prev.filter((_, index) => index !== idx))
  }

  const handleDefaultApiKey = key => {
    if (key === defaultApiKey) return
    setDefaultApiKey(key)
    updateChatGPTDefaultApiKey(key)
  }

  useEffect(() => {
    getApiKeys().then(res => {
      if (res.keys.length === 0) return
      setApiKeys(res.keys)
      setDefaultApiKey(res.default)
    })
  }, [])

  const Suspenser = () => {
    return <CircularProgress size={'20px'} sx={{ color: 'text.secondary' }} />
  }

  return (
    <div className="chatbot-arsenal-window">
      {loaded ? (
        <>
          <div className="arsenal-content">
            <div className="ollama-tips noselect">
              <img
                className="ollama-img"
                src="http://localhost:3000/ollama.png"></img>
              <div className="bulletin">Ollama</div>
            </div>
            {OllamaTips}
            <div className="accordion-list">
              {InstalledList}
              {UninstalledList}
            </div>
            <div className="ollama-tips noselect">
              <img
                className="chatgpt-img"
                src="http://localhost:3000/chatgpt.png"></img>
              <div className="bulletin">ChatGPT</div>
            </div>
            <div className="api-key-container noselect">
              <List
                subheader={
                  <ListSubheader component="div" id="nested-list-subheader">
                    API Keys
                  </ListSubheader>
                }
                sx={{
                  py: 0,
                  width: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper'
                }}>
                {apiKeys.map((each, index) => {
                  let value = each.length > 7 ? each.slice(0, 7) + '****' : each
                  const isClicked = each === defaultApiKey

                  if (isClicked) {
                    value += '   (In Usage)'
                  }

                  return (
                    <div
                      key={`api-keys-${index}`}
                      style={{
                        display: 'flex'
                      }}>
                      <Radio
                        checked={isClicked}
                        onClick={() => handleDefaultApiKey(each)}
                        disableRipple
                        color="default"
                        size="small"
                      />
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleApiKeyRemoving(index)}>
                            <DeleteIcon />
                          </IconButton>
                        }>
                        <ListItemText
                          primaryTypographyProps={{
                            fontSize: '15px',
                            fontFamily: `'Courier New', Courier, monospace`,
                            fontWeight: 500
                          }}
                          primary={value}
                        />
                      </ListItem>
                      {index !== apiKeys.length - 1 ? <Divider /> : <></>}
                    </div>
                  )
                })}
                {isAddingKey ? (
                  <>
                    <Divider />
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleSubmitApiKey(inputValue)}>
                          <CheckIcon />
                        </IconButton>
                      }>
                      <Input
                        sx={{
                          fontSize: '15px',
                          fontFamily: `'Courier New', Courier, monospace`,
                          fontWeight: 500
                        }}
                        onChange={event => {
                          setInputValue(event.target.value)
                        }}
                        onKeyDown={event => {
                          if (event.key !== 'Enter') return
                          handleSubmitApiKey(inputValue)
                        }}
                        value={inputValue}
                      />
                    </ListItem>
                  </>
                ) : (
                  <></>
                )}
              </List>

              <Button onClick={handleAddApiKeyClick}>
                <AddIcon />
                <span style={{ paddingLeft: '0.25rem' }}>新增 API Key</span>
              </Button>
            </div>
            <div className="ollama-tips noselect">
              <img
                className="ollama-img"
                src="http://localhost:3000/whisper.png"></img>
              <div className="bulletin">Whisper</div>
            </div>
          </div>
          <div className="downloading">
            <div className="download-title">Downloading</div>
            {pulling.map((each, index) => {
              const { name, total, completed, done } = each
              const percentage =
                !completed || !total ? 0 : (completed / total) * 100
              return (
                <div key={`pulling-model-${index}`} className="download-block">
                  <div className="title">{name}</div>
                  <LinearProgressWithLabel value={percentage} />
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>{Suspenser}</>
      )}
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
  modified_at
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
      // expanded={expanded}
      style={{ boxShadow: 'none' }}
      sx={{
        '&:before': {
          display: 'none'
        },
        borderBottom: '1px solid #dddddd'
      }}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon onClick={setExpanded} />}
        sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
        <Typography
          variant="h5"
          fontFamily={`'Courier New', Courier, monospace`}
          sx={{ width: installed ? '100%' : '92%', fontWeight: 600 }}
          onClick={setExpanded}>
          {name}
        </Typography>
        {AdequateIcon}
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          sx={{ width: '100%' }}
          fontFamily={`'Courier New', Courier, monospace`}>
          {description}
        </Typography>
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
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  )
}

export default ChatBotArsenal
