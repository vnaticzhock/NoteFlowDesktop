import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  editNodeContent,
  editNodeTitle,
  fetchFavoriteNodes
} from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import { SearchIcon } from '../Common/Mui.jsx'
import Editor from '../NewEditor/Editor.tsx'
import './Library.scss'

const Library = () => {
  const { translate } = useLanguage()

  const [nodes, setNodes] = useState([])
  const [editorId, setEditorId] = useState(null)
  const [editorInitContent, setEditorInitContent] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchFavoriteNodes().then(res => {
      setNodes(res)
      res.length > 0 ? setEditorId(res[0].id) : setEditorId(null)
    })
  }, [])

  useEffect(() => {
    const selectedNode = nodes.find(n => n.id === editorId)
    if (selectedNode && selectedNode.content)
      setEditorInitContent(JSON.parse(selectedNode.content))
  }, [editorId])

  const updateEditor = (id, blockContent) => {
    const title = blockContent.find(b => b.type === 'heading')?.content[0]?.text
    if (title !== '' || title !== undefined || title !== null) {
      editNodeTitle(id, title)
      setNodes(nds =>
        nds.map(n => {
          if (n.id === id) {
            n = {
              ...n,
              title: title
            }
          }
          return n
        })
      )
    }
    const editorContent = JSON.stringify(blockContent)
    editNodeContent(id, editorContent)
    editingNodeCallback(id, editorContent)
  }

  const editingNodeCallback = useCallback(
    (id, editorContent) => {
      setNodes(nds => {
        return nds.map((n, index) => {
          if (n.id === id) {
            n = {
              ...n,
              content: editorContent
            }
          }
          return n
        })
      })
    },
    [nodes]
  )

  const getTime = time => {
    const now = new Date()
    now.setHours(now.getHours() - 8)
    time = new Date(time)

    const timeDiff = now - time
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor(timeDiff / (1000 * 60))
    if (days >= 1) {
      return { time: days, unit: days === 1 ? 'day' : 'days' }
    } else if (hours >= 1) {
      return { time: hours, unit: hours === 1 ? 'hour' : 'hours' }
    } else {
      return { time: minutes, unit: minutes <= 1 ? 'minute' : 'minutes' }
    }
  }

  const search = (key, query) => {
    if (key === 'Enter') {
      setQuery(query)
      const filterNodes = nodes.filter(node => {
        if (query === '') {
          return true
        }
        return node.title.includes(query)
      })
      setNodes(filterNodes)

      if (filterNodes.length > 0) {
        setEditorId(filterNodes[0].id)
      }
    }
  }

  const MenuList = useMemo(() => {
    return nodes
      .filter(node => {
        if (query === '') {
          return true
        }
        return node.title.includes(query)
      })
      .map(node => {
        const editTime = getTime(node.update_time)
        return (
          <div
            className="node-button"
            onClick={() => {
              setEditorId(node.id)
            }}
            key={node.id}
            selected={node.id === editorId}>
            <div className="node-title">{node.title}</div>
            <div className="node-last-edit-time">
              {translate('Last Edit Time:')} {editTime.time}
              {' ' + translate(editTime.unit) + translate('ago')}
            </div>
          </div>
        )
      })
  }, [nodes])
  return (
    <div className="library-container">
      <div className="search-container">
        <div className="search-area">
          <div className="search-icon">
            <SearchIcon fontSize="inherit" />
          </div>

          <input
            type="text"
            placeholder="search..."
            onKeyDown={e => search(e.key, e.target.value)}
          />
        </div>
        {MenuList}
      </div>
      <div className="editor-container">
        <Editor
          editorId={editorId}
          editorInitContent={editorInitContent}
          updateEditor={updateEditor}
        />
      </div>
    </div>
  )
}

export default Library
