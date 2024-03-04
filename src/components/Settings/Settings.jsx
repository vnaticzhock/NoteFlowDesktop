import React from 'react'
import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdLanguage } from 'react-icons/md'
import { styled } from '@mui/material/styles'
import { RiLockPasswordLine } from 'react-icons/ri'
import { BsFiletypeCss } from 'react-icons/bs'
import { AiOutlineMail } from 'react-icons/ai'
import { BiLogOut } from 'react-icons/bi'
// import { VITE_AVAI_CSS, useApp } from '../../hooks/useApp'
// import instance from '../../API/api'
import ResetModal from './ResetModal'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../providers/i18next'
import './Settings.scss'
import { getPhoto, uploadPhoto } from '../../apis/APIs'
import { Document, Page } from 'react-pdf'

const Settings = () => {
  const { language, translate, changeLanguage } = useLanguage()

  const [show, setShow] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)

  const SettingsButton = styled(Button)(({ theme }) => ({
    cursor: 'pointer',
    backgroundColor: '#0e1111',
    color: 'white',
    width: '100%',
    variant: 'outlined',
    ':hover': {
      backgroundColor: 'lightgrey',
    },
  }))

  const handleUploadPhoto = async () => {
    const imgInput = document.getElementById('avatar')
    const file = imgInput.files[0]
    uploadPhoto(file.path).then(() => {
      getPhoto().then((res) => {
        setPhotoUrl(res.avatar)
      })
    })
  }

  useEffect(() => {
    const imgInput = document.getElementById('avatar')
    imgInput.addEventListener('change', handleUploadPhoto)
    return () => {
      imgInput.removeEventListener('change', handleUploadPhoto)
    }
  }, [])

  useEffect(() => {
    getPhoto().then((res) => {
      setPhotoUrl(res.avatar)
    })
  })

  return (
    <Grid container columns={12} sx={{ height: '100%' }}>
      <Grid item xs={12} md={6}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <div className="avatar-container">
            <div className="custom-file-upload">
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/png, image/jpeg"
                hidden
              ></input>
              <label htmlFor="avatar" className="avatar-label">
                {/* <span>Select your avatar</span> */}
                {!photoUrl ? (
                  <BsFillPersonFill
                    color="black"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div className="avatar-img-div">
                    <img src={photoUrl} className="avatar-img" alt=""></img>
                  </div>
                )}
              </label>
            </div>
          </div>
          {/* <Document file="pdfs/Normalizing-Flow-Survey.pdf">
            <Page pageNumber={1} />
          </Document> */}
        </Stack>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Stack
          direction="column"
          justifyContent="center"
          // alignItems={isMobile ? "center" : "left"}
          alignItems="left"
          sx={{ height: '100%', gap: '2vmin' }}
        >
          <Typography sx={{ fontSize: '24px', marginBottom: '10px' }}>
            {/* {user.name} */}
          </Typography>

          <Stack direction="row" justifyContent="left" alignItems="center">
            <AiOutlineMail
              size={25}
              style={{ marginRight: '15px' }}
            ></AiOutlineMail>
            <Typography>{/* {user.email} */}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="left" alignItems="center">
            <BsFiletypeCss
              size={25}
              style={{ marginRight: '15px' }}
            ></BsFiletypeCss>
            {/* <select
              className="noteflow-css-selector"
              value={cssValue}
              onChange={(e) => {
                setCssValue(e.target.value)
              }}
            >
              {VITE_AVAI_CSS.map((data, index) => {
                return (
                  <option
                    value={data}
                    key={`quill-code-css-${index}`}
                    id={`quill-code-css-${index}`}
                  >
                    {data}
                  </option>
                )
              })}
            </select> */}
          </Stack>
          <Stack direction="row" justifyContent="left" alignItems="center">
            <RiLockPasswordLine
              size={25}
              style={{ marginRight: '15px' }}
            ></RiLockPasswordLine>
            <SettingsButton onClick={() => setShow(true)}>
              {translate('Reset Password')}
            </SettingsButton>
          </Stack>
          <Stack direction="row" justifyContent="left" alignItems="center">
            <MdLanguage size={25} style={{ marginRight: '15px' }}></MdLanguage>
            <SettingsButton onClick={() => changeLanguage()}>
              {translate(
                'Switch to ' + (language === 'en' ? 'Chinese' : 'English'),
              )}
            </SettingsButton>
          </Stack>
          <Stack direction="row" justifyContent="left" alignItems="center">
            <BiLogOut size={25} style={{ marginRight: '15px' }}></BiLogOut>
            <SettingsButton onClick={() => {}}>
              {translate('Log out')}
            </SettingsButton>
          </Stack>
        </Stack>
        <ResetModal
          show={show}
          setShow={setShow}
          handleClose={() => setShow(false)}
        />
      </Grid>
    </Grid>
  )
}
export default Settings
