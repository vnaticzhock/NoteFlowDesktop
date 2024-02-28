import React from 'react'
import { useRef, useState } from 'react'
import { Button, TextField, Link, Box } from '../../components/Common/Mui.jsx'
import './Login.scss'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../providers/i18next.jsx'
import { SHA256 } from 'crypto-js'

const Login = () => {
  const { language, changeLanguage, translate } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alarms, setAlarms] = useState('')

  const navigateTo = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const passwordHashed = SHA256(password).toString()
    const request = {
      user: {
        email: email,
        password: passwordHashed,
      },
    }
    /**
     * chatgpt: 考虑使用Formik库配合Yup进行表单验证，
     * 这样可以简化表单的状态管理和验证逻辑。
     * Formik提供了一个易于管理表单状态、获取输入值、
     * 以及处理表单提交的方式，
     * 而Yup则用于定义一个表单值的模式（schema）来执行验证。
     *  */
  }
  return (
    <div className="info">
      <h2>{translate('Login')}</h2>
      <div className="infoContainer">
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate // 再使用 handleSubmit 實現自己的邏輯
          className="formBox"
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={translate('Email Address')}
            name="email"
            autoComplete="email" // 對手機設備的用戶很友善！
            autoFocus
            size="small"
            onChange={(e) => {
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
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
          <div className="alarm">{alarms}</div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 1 }}
            style={{
              backgroundColor: '#0e1111',
              color: 'white',
              paddingTop: '1vh',
              textTransform: 'none',
            }}
          >
            {translate('Login')}
          </Button>
          <div className="links">
            <Link
              variant="body2"
              style={{
                color: '#414a4c',
                cursor: 'pointer',
              }}
              onClick={() => navigateTo('/login/forgot-password')}
            >
              {translate('Forgot password?')}
            </Link>
            <Link
              variant="body2"
              style={{
                color: '#414a4c',
                cursor: 'pointer',
              }}
              onClick={() => navigateTo('/login/register')}
            >
              {translate("Don't have an account? Sign Up")}
            </Link>
          </div>
        </Box>
      </div>
      <div className="horizontalLine">
        <span>{translate('OR')}</span>
      </div>
      <Button
        type="submit"
        variant="contained"
        className="signInDiv"
        onClick={() => {}}
      >
        離線模式
      </Button>
      <Button
        type="submit"
        variant="contained"
        className="i18n"
        onClick={() => changeLanguage()}
      >
        {translate('Switch to ' + (language === 'en' ? 'Chinese' : 'English'))}
      </Button>
    </div>
    // </div>
  )
}

export default Login
