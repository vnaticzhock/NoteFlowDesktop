import React, { createContext, useContext, useEffect, useRef } from 'react'

const FlowKeyManagerContext = createContext({ MetaKey: false })

export const FlowKeyManagerProvider = ({ children }) => {
  const MetaKey = useRef(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Meta') {
        console.log('press meta')
        MetaKey.current = true
      }
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Meta') {
        console.log('key up meta')
        MetaKey.current = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <FlowKeyManagerContext.Provider value={{ MetaKey: MetaKey }}>
      {children}
    </FlowKeyManagerContext.Provider>
  )
}

const useFlowKeyManager = () => useContext(FlowKeyManagerContext)

export { useFlowKeyManager }
