import React, { useCallback, useState } from 'react'
import './ChatBotArsenal.scss'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop'

const ChatBotArsenal = () => {
  const [expanded, setExpanded] = useState(null)

  const handleExpanded = useCallback(
    (id) => {
      if (expanded === id) {
        setExpanded(null)
      } else {
        setExpanded(id)
      }
    },
    [expanded],
  )

  return (
    <div className="arsenalWindow">
      <div className="accordionList">
        {/* <div className="horizontalLine"> */}
        <Typography
          variant="h4"
          style={{ paddingTop: '10px', paddingBottom: '10px' }}
        >
          已安裝
        </Typography>
        {/* </div> */}
        {Weapons.map((each, index) => {
          const { id, title, content } = each
          return (
            <WeaponComponent
              key={`accordion-${id}`}
              id={id}
              title={title}
              content={content}
              expanded={expanded}
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
      </div>
      <div className="accordionList">
        <Typography
          variant="h4"
          style={{ paddingTop: '10px', paddingBottom: '10px' }}
        >
          未安裝
        </Typography>
        {Weapons.map((each, index) => {
          const { id, title, content } = each
          return (
            <WeaponComponent
              key={`accordion-${id}`}
              id={id}
              title={title}
              content={content}
              expanded={expanded}
              setExpanded={() => handleExpanded(id)}
            />
          )
        })}
      </div>
    </div>
  )
}

const WeaponComponent = ({ id, title, content, expanded, setExpanded }) => {
  return (
    <Accordion
      expanded={expanded === id}
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
          sx={{ width: '90%', fontWeight: 600 }}
          onClick={setExpanded}
        >
          {title}
        </Typography>
        <InstallDesktopIcon
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            console.log('hi?')
            // pullModel(id)
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ width: '70%' }}>{content}</Typography>
      </AccordionDetails>
    </Accordion>
  )
}

const Weapons = [
  {
    id: 'llama2',
    title: 'llama2',
    content:
      'Llama 2 is a collection of foundation language models ranging from7B to 70B parameters.',
  },

  {
    id: 'Breeze-7B',
    title: 'Breeze-7B',
    content:
      'MediaTek Research Breeze-7B (hereinafter referred to as Breeze-7B)\
      is a language model family that builds on top of Mistral-7B,\
      specifically intended for Traditional Chinese use.',
  },
]

export default ChatBotArsenal
