import { Grid, Stack } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineMail } from 'react-icons/ai'
import { BiLogOut } from 'react-icons/bi'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdLanguage } from 'react-icons/md'
import { RiLockPasswordLine } from 'react-icons/ri'
import { getPhoto, uploadPhoto } from '../../apis/APIs'
import { useLanguage } from '../../providers/i18next'
import ResetModal from './ResetModal'
import './Settings.scss'

const AvatarUpload = ({ photoUrl, onUpload }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    await onUpload(file)
  }

  return (
    <div className="avatar-container">
      <div className="custom-file-upload">
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/png, image/jpeg"
          hidden
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <label htmlFor="avatar" className="avatar-label">
          {!photoUrl ? (
            <BsFillPersonFill
              color="black"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar-img-div">
              <img src={photoUrl} className="avatar-img" alt="avatar" />
            </div>
          )}
        </label>
      </div>
    </div>
  )
}

const SettingsButton = ({ icon: Icon, onClick, children }) => (
  <Stack
    direction="row"
    justifyContent="left"
    alignItems="center"
    sx={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <Icon size={25} style={{ marginRight: '15px' }} />
    {children}
  </Stack>
)

const Settings = () => {
  const { language, translate, changeLanguage } = useLanguage()
  const [show, setShow] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)

  useEffect(() => {
    getPhoto().then((res) => {
      if (!res) return
      setPhotoUrl(res.avatar)
    })
  }, [])

  const handleUploadPhoto = async (file) => {
    uploadPhoto(file?.path)
      .then((_) => getPhoto())
      .then((res) => setPhotoUrl(res.avatar))
  }

  return (
    <Grid container columns={12} sx={{ height: '100%' }}>
      <Grid item xs={12} md={6}>
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <AvatarUpload photoUrl={photoUrl} onUpload={handleUploadPhoto} />
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
          alignItems="left"
          sx={{ height: '100%', gap: '2vmin' }}
        >
          <SettingsButton icon={AiOutlineMail}>
            {/* user.email */}
          </SettingsButton>
          <SettingsButton
            icon={RiLockPasswordLine}
            onClick={() => setShow(true)}
          >
            {translate('Reset Password')}
          </SettingsButton>
          <SettingsButton icon={MdLanguage} onClick={() => changeLanguage()}>
            {translate(
              'Switch to ' + (language === 'en' ? 'Chinese' : 'English'),
            )}
          </SettingsButton>
          <SettingsButton icon={BiLogOut}>
            {translate('Log out')}
          </SettingsButton>
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
