import React, { useEffect, useState } from 'react'
import { Button, TextField } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import CloseIcon from '@mui/icons-material/Close'
import './EditorSettings.scss'
import { useLanguage } from '../../providers/i18next.jsx'
// import { useApp } from '../../hooks/useApp'
// import { useTranslation } from 'react-i18next'

const Settings = ({ editorId, setShowSettings }) => {
  const { translate } = useLanguage()
  const [allColabs, setAllColabs] = useState(null)
  const [colabInput, setColabInput] = useState('')
  const [alarms, setAlarms] = useState('')

  const handleSubmit = async () => {}

  useEffect(() => {
    if (allColabs) {
      allColabs.forEach((data, index) => {
        const each = document.querySelector(`#colab-node-${index}`)
        if (data.status === 200) {
          each.style.border = undefined
        } else {
          each.style.border = '1px solid red'
        }
      })
    }
  }, [allColabs])

  return (
    <div className="editor-settings">
      <div className="share-box">
        {/* <div className="title"> */}
        <h2> {translate('Share Node')}</h2>
        {/* </div> */}
        <TextField
          margin="normal"
          // required
          fullWidth
          name="colabs"
          label=""
          type="text"
          id="colabs"
          size="small"
          value={colabInput}
          // placeholder="新增使用者"
          onChange={(e) => {
            setColabInput(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (allColabs)
                setAllColabs((state) => [
                  ...state,
                  { email: colabInput, type: 'new', status: 200 },
                ])
              else
                setAllColabs([{ email: colabInput, type: 'new', status: 200 }])
              setColabInput('')
            }
          }}
          InputProps={{
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              // position: 'relative',
              // height: '100%',
            },
            startAdornment:
              allColabs === null
                ? undefined
                : //  (
                  // <div
                  //   className="adorment"
                  //   style={{
                  //     marginRight: '10px',
                  //     display: 'flex',
                  //     flexWrap: 'wrap',
                  //     height: '70%',
                  //     width: 'calc(100% - 5px)',
                  //     overflowY: 'scroll',
                  //   }}
                  // >
                  // {
                  allColabs.map((data, index) => {
                    return data.type === 'remove' ? (
                      // <div
                      //   id={`colab-node-${index}`}
                      //   key={`colab-node-${index}`}
                      //   style={{ display: 'none' }}
                      // ></div>
                      <></>
                    ) : (
                      <div
                        id={`colab-node-${index}`}
                        key={`colab-node-${index}`}
                        className="colab-tags"
                      ></div>
                    )
                  }),
            // }
            // </div>
            // ),
          }}
        />
        <div
          style={{
            color: 'red',
            height: '18px',
            textAlign: 'left',
            padding: '0 5px 0 5px',
          }}
        >
          {alarms}
        </div>
        <div className="buttons">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
            }}
            variant="contained"
            style={{
              borderRadius: '30px',
              border: 'black solid 1px',
              color: 'black',
              textTransform: 'none',
              width: '120px',
              height: '50px',
              display: 'flex',
              gap: '2px',
            }}
          >
            <LinkIcon />
            {translate('Copy Link')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            style={{
              backgroundColor: '#0e1111',
              height: '50px',
              borderRadius: '30px',
              color: 'white',
              paddingTop: '5px',
              width: '80px',
              textTransform: 'none',
            }}
          >
            {translate('Done')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
