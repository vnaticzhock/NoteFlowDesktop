import './Register.scss'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { SHA256 } from 'crypto-js'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLanguage } from '../../providers/i18next'

const Register = () => {
  const { translate } = useLanguage()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')
  const [alarms, setAlarms] = useState('')
  const navigateTo = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    const passwordHashed = SHA256(password).toString()
    const checkPasswordHashed = SHA256(checkPassword).toString()
    const request = {
      user: {
        name,
        email,
        password: passwordHashed
      }
    }
    if (passwordHashed !== checkPasswordHashed) {
      alert('Wrong password')
    }
  }

  return (
    <div className="info">
      <h2>{translate('Register')}</h2>
      <div className="infoContainer">
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          className="formBox">
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label={translate('Name')}
            name="name"
            autoComplete="name"
            autoFocus
            size="small"
            onChange={e => {
              setName(e.target.value)
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={translate('Email Address')}
            name="email"
            autoComplete="email"
            size="small"
            onChange={e => {
              setEmail(e.target.value)
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={translate('Password')}
            type="password"
            id="password"
            autoComplete="current-password"
            size="small"
            onChange={e => {
              setPassword(e.target.value)
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={translate('Check Password')}
            type="password"
            id="check-password"
            autoComplete="current-password"
            size="small"
            onChange={e => {
              setCheckPassword(e.target.value)
            }}
          />
          <div className="alarm">{alarms}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
            // className='buttonRow'
          >
            <Button
              variant="contained"
              sx={{ mt: 2, mb: 2, width: '45%' }}
              style={{ backgroundColor: 'white', color: 'black' }}
              onClick={() => navigateTo('/login')}>
              {translate('Cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2, mb: 2, width: '45%' }}
              style={{ backgroundColor: '#0e1111', color: 'white' }}>
              {translate('Register')}
            </Button>
          </div>
        </Box>
      </div>
    </div>
  )
}

export default Register
