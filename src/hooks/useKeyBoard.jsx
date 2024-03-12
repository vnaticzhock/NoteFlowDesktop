import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

const useKeyBoard = (callback, keys, setKeys, node = null) => {
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  const handleKeyDown = useCallback(
    (event) => {
      if (!keys.includes(event.key)) {
        const newKeys = [...keys, event.key]
        setKeys(newKeys)
        callbackRef.current(newKeys)
      }
    },
    [keys],
  )

  const handleKeyup = useCallback(
    (event) => {
      const newKeys = keys.filter((key) => key !== event.key)
      setKeys(newKeys)
      callbackRef.current(newKeys)
      setKeys([])
    },
    [keys],
  )

  useEffect(() => {
    // target is either the provided node or the document
    const targetNode = node ?? document
    // attach the event listener
    targetNode && targetNode.addEventListener('keydown', handleKeyDown)
    targetNode && targetNode.addEventListener('keyup', handleKeyup)
    // remove the event listener
    return () => {
      targetNode && targetNode.removeEventListener('keydown', handleKeyDown)
      targetNode && targetNode.removeEventListener('keyup', handleKeyup)
    }
  }, [handleKeyDown, node])
}

export default useKeyBoard
