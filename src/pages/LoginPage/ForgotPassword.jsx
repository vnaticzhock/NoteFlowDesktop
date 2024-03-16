import "./ForgotPassword.scss";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

const ForgotPassword = () => {
  const {t} = useTranslation();
  const [email, setEmail] = useState("");
  const navigateTo = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    // instance.post('/user/reset-password-send-email', { email }).then((res) => {
    //   alert('Email 已經寄出，請前往收信');
    // });
  };

  return (
    <div className="info">
      <h2>{t("Forgot password")}</h2>
      <div className="infoContainer">
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          style={{margin: "1vh 1vw", width: "80%"}}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("Email Address")}
            name="email"
            autoComplete="email"
            autoFocus
            size="small"
            onChange={e => {
              setEmail(e.target.value);
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}>
            <Button
              variant="contained"
              sx={{mt: 2, mb: 2, width: "45%"}}
              style={{backgroundColor: "white", color: "black"}}
              onClick={() => navigateTo("/")}>
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{mt: 2, mb: 2, width: "45%"}}
              style={{backgroundColor: "#0e1111", color: "white"}}>
              {t("Send")}
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default ForgotPassword;
