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
  downloadWhisperModel,
  getApiKeys,
  getModelList,
  getPullingProgress,
  isPullingModel,
  listUserWhisperModels,
  listWhisperModels,
  pullModel,
  removeChatGPTApiKey,
  updateChatGPTDefaultApiKey
} from '../../apis/APIs'
import {
  InstalledModel,
  UninstalledModel,
  IPullingModel,
  IInstalledOllamaModel,
  IOllamaModel
} from '../../types/llms/llm'

type IOllamaModels = {
  installed: Array<InstalledModel>
  uninstalled: Array<UninstalledModel>
}

const ChatBotArsenal = ({ isOllama }) => {
  const [expanded, setExpanded] = useState<string>('')
  const [models, setModels] = useState<IOllamaModels>({
    installed: [],
    uninstalled: []
  })
  const [isPulling, setIsPulling] = useState<boolean>(false)

  // models that are pulling
  const [pulling, setPulling] = useState<IPullingModel[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)

  // Ollama 是否安裝
  const OllamaTips = useMemo(() => {
    if (!isOllama) {
      return (
        <>
          <div className="ollama-uninstall noselect">
            Do not detect Ollama working in your environment.
          </div>
        </>
      )
    }
    return (
      <div className="accordion-list">
        <div className="ollama-list-header">Installed</div>
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
              installed={true}
              installing={false}
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
        <div className="ollama-list-header">Uninstalled</div>
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
              id={id}
              name={name}
              description={description}
              expanded={expanded === id}
              installFunction={() => void handleOllamaInstall(id)}
              installed={false}
              installing={installing}
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
      </div>
    )
  }, [isOllama, models, expanded, pulling])

  // Ollama 下載邏輯
  const fetchOllamaModels = (): void => {
    void getModelList().then(res => {
      const { installed, uninstalled } = res
      setModels({ installed, uninstalled })
      setLoaded(true)
    })
  }

  const checkIsPulling = async (): Promise<void> => {
    const isPulling = await isPullingModel()
    if (isPulling) {
      setIsPulling(true)
    }
  }

  const handleOllamaInstall = async (id: string): Promise<void> => {
    await pullModel(id)

    setPulling(prev => [
      ...prev,
      {
        name: id,
        total: 0,
        completed: -1
      }
    ])

    setIsPulling(true)
  }

  const handleWhisperInstall = async (id: string): Promise<void> => {
    await downloadWhisperModel(id)

    setPulling(prev => [
      ...prev,
      {
        name: id,
        total: 0,
        completed: -1
      }
    ])

    setIsPulling(true)
  }

  const handleExpanded = useCallback(
    id => {
      if (expanded === id) {
        // 按第二次同樣的按鍵則跳回主頁面
        setExpanded('')
      } else {
        setExpanded(id)
      }
    },
    [expanded]
  )

  useEffect(() => {
    if (isOllama) {
      fetchOllamaModels()
    }
    void checkIsPulling()
  }, [isOllama])

  useEffect(() => {
    if (!isPulling) return

    // 確認正在 Pulling model 之後觸發一個 interval, 定期確認進度
    const checkInterval = setInterval(() => {
      void getPullingProgress().then(progress => {
        setPulling(progress)
        if (progress.length < pulling.length) {
          // 條件成立, 代表有一個 model 已經下載完成了, 我們可以重整頁面
          fetchOllamaModels()
          void listUserWhisperModels().then(models => {
            setWhisperModels(models)
          })
        }
        if (progress.length === 0) {
          console.log('下載好了！')
          clearInterval(checkInterval)
          setIsPulling(false)
        }
      })
    }, 1000)

    // 無故離開該頁面, 也先清除該 Interval
    return (): void => clearInterval(checkInterval)
  }, [isPulling])

  // ChatGPT 邏輯

  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSubmitApiKey = (apiKey): void => {
    void addChatGPTApiKey(apiKey)
    if (apiKeys.length === 0) {
      void updateChatGPTDefaultApiKey(apiKey)
      setDefaultApiKey(apiKey)
    }
    setApiKeys(prev => [...prev, apiKey])
    setInputValue('')
    setIsAddingKey(false)
  }

  const handleApiKeyRemoving = (key: string): void => {
    // frontend
    setApiKeys(prev => prev.filter(each => each !== key))

    // backend
    void removeChatGPTApiKey(key)
    if (key === defaultApiKey) {
      // 設定新的 default api key，先設定為空白，也就是不一定要有 default api key
      void updateChatGPTDefaultApiKey('')
    }
  }

  const handleDefaultApiKey = (key: string): void => {
    if (key === defaultApiKey) return

    // frontend
    setDefaultApiKey(key)

    // backend
    void updateChatGPTDefaultApiKey(key)
  }

  // Whisper Logics
  const [whisperModels, setWhisperModels] = useState<{
    installed: Array<string>
    uninstalled: Array<string>
  }>({
    installed: [],
    uninstalled: []
  })

  useEffect(() => {
    // OpenAI keys
    void getApiKeys().then(res => {
      if (res.keys.length === 0) return
      setApiKeys(res.keys)
      setDefaultApiKey(res.default)
    })

    // Whisper Models
    void listUserWhisperModels().then(models => {
      setWhisperModels(models)
    })
  }, [])

  const WhisperTips = useMemo(() => {
    return (
      <div className="accordion-list">
        <div className="ollama-list-header">Installed</div>
        {whisperModels.installed.map((name, index) => {
          return (
            <ModelComponent
              key={`accordion-${name}`}
              id={name}
              name={name}
              description={''}
              expanded={expanded === name}
              installed={true}
              installing={false}
              setExpanded={() => handleExpanded(name)}
            />
          )
        })}
        <div className="ollama-list-header">Uninstalled</div>
        {whisperModels.uninstalled.map((name, index) => {
          const installing = pulling.reduce(
            // 如果 model 是正在 pulling 的，則回傳 true
            (acc, cur) => acc || cur.name === name,
            false
          )

          return (
            <ModelComponent
              key={`accordion-${name}`}
              id={name}
              name={name}
              description={''}
              expanded={expanded === name}
              installFunction={() => void handleWhisperInstall(name)}
              installed={false}
              installing={installing}
              setExpanded={() => handleExpanded(name)}
            />
          )
        })}
      </div>
    )
  }, [whisperModels, pulling, expanded])

  if (!loaded) {
    return (
      <div className="chatbot-arsenal-window">
        <CircularProgress size={'20px'} sx={{ color: 'text.secondary' }} />
      </div>
    )
  }

  return (
    <div className="chatbot-arsenal-window">
      <div className="arsenal-content">
        <div className="ollama-tips noselect">
          <img
            className="ollama-img"
            src="http://localhost:3000/ollama.png"></img>
          <div className="bulletin">Ollama</div>
        </div>
        {OllamaTips}
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
                        onClick={() => handleApiKeyRemoving(each)}>
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

          <Button onClick={() => setIsAddingKey(true)}>
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
        {/* <div className="ollama-uninstall noselect">
          {"Haven't implement install functionality."}
        </div> */}
        {WhisperTips}
      </div>
      <div className="downloading">
        <div className="download-title">Downloading</div>
        {pulling.map((each, index) => {
          const { name, total, completed } = each
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
    </div>
  )
}

type IModelComponent = IOllamaModel &
  Partial<IInstalledOllamaModel> & {
    expanded: boolean
    setExpanded: () => void
    installFunction?: () => void
    installed: boolean
    installing: boolean
  }

const ModelComponent = ({
  name,
  description,
  expanded,
  setExpanded,
  installed,
  installing,
  installFunction,
  parameter_size,
  quantization_level,
  digest,
  modified_at
}: IModelComponent): React.JSX.Element => {
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
            if (installFunction) {
              installFunction()
            } else {
              console.error('install function is not found.')
            }
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
          display: 'none'
        },
        maxWidth: '55vw'
      }}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon onClick={setExpanded} />}>
        <div className="accordion-title">
          <span className="ollama-model-name" onClick={setExpanded}>
            {name}
          </span>
          {AdequateIcon}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="ollama-model-desc">
          <span>{description}</span>
          {installed ? (
            <>
              <div>Parameters: </div>
              <div>{parameter_size}</div>
              <div>{quantization_level}</div>
              <div>{digest}</div>
              <div>{modified_at?.toString()}</div>
            </>
          ) : (
            <></>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

const LinearProgressWithLabel = (props): React.JSX.Element => {
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
