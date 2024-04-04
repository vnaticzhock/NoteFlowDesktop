import database from '../sqlite.js'
import type {
  IOllamaConfigs,
  IChatGPTConfigs,
  IWhisperConfigs,
  IModelConfig
} from '../../types/llms/llm.js'

const ensureTableExists = () => {
  const stmt = `
    CREATE TABLE IF NOT EXISTS parameters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT UNIQUE,
      config TEXT     -- JSON-stringified.
    );
  `

  database.exec(stmt)
}

const fetchConfig = (_, model: string): IModelConfig => {
  // check table 是否存在，存在拿裡面的值，不存在拿 DefaultConfig
  if (!Object.keys(DEFAULT_CONFIG).includes(model)) {
    console.assert(undefined, 'you are fetching invalid model')
  }
  ensureTableExists()

  try {
    const stmt = database.prepare('SELECT * FROM parameters WHERE model = ?')
    const result = stmt.all(model)

    return JSON.parse(result[0].config)
  } catch {
    const stmt = database.prepare(
      'INSERT INTO parameters (model, config) VALUES (?, ?)'
    )

    const defaults = getDefaultConfig(model)
    stmt.run(model, JSON.stringify(defaults))

    return defaults
  }
}

const updateConfig = (_, model: string, config: any) => {
  if (!Object.keys(DEFAULT_CONFIG).includes(model)) {
    console.assert(undefined, 'you are updating invalid model')
  }
  if (!compareKeys(config, DEFAULT_CONFIG[model])) {
    console.assert(undefined, 'your schema is weird.')
  }

  const stmt = database.prepare(
    'UPDATE parameters SET config = ? WHERE model = ?'
  )
  stmt.run(JSON.stringify(config), model)
  console.log(`Parameter of model ${model} was successfully updated.`)
}

const compareKeys = (obj1: any, obj2: any) => {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // 如果鍵的數量不同，則回傳 false
  if (keys1.length !== keys2.length) {
    return false
  }

  // 檢查每個鍵是否都存在於對方身上
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }
  }

  return true
}

const DEFAULT_CONFIG: {
  ollama: IOllamaConfigs
  chatgpt: IChatGPTConfigs
  whisper: IWhisperConfigs
} = {
  ollama: {
    num_ctx: 4096,
    temperature: 0.7,
    tfs_z: 1,
    top_k: 40,
    top_p: 0.9
  },
  chatgpt: {
    frequency_penalty: 0,
    max_tokens: -1,
    temperature: 1,
    top_p: 1
  },
  whisper: {
    no_timestamps: true,
    length_ms: 10000,
    step_ms: 3000,
    keep_ms: 200,
    max_tokens_in_stream: 32,
    use_vad: true,
    vad_threshold: 0.6
  }
}

const getDefaultConfig = (model: string): IModelConfig => {
  return DEFAULT_CONFIG[model]
}

export { getDefaultConfig, fetchConfig, updateConfig }
