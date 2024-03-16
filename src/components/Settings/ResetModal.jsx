import "./ResetModal.scss";

import CloseIcon from "@mui/icons-material/Close";
import {Backdrop, Box, Button, Fade, Modal} from "@mui/material";
import TextField from "@mui/material/TextField";
import {SHA256} from "crypto-js";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

import {useLanguage} from "../../providers/i18next";
// import instance from '../../API/api'

export default function ResetModal({show, setShow, handleClose, flowId}) {
  const {translate} = useLanguage();
  const [password, setPassword] = useState({
    original: "",
    new: "",
    check: "",
  });
  const [alarms, setAlarms] = useState("");

  useEffect(() => {
    if (show) {
      setPassword({
        original: "",
        new: "",
        check: "",
      });
      setAlarms("");
    }
  }, [show]);

  const handleSubmit = async () => {};

  return (
    <Modal
      className="styled-modal"
      open={show}
      onClose={handleClose}
      closeAfterTransition>
      <Fade in={show}>
        <Box
          className="modal-content"
          component="form"
          onSubmit={handleSubmit}
          noValidate
          style={{margin: "10px 15px"}}>
          <h2>{translate("Reset Password")}</h2>
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label={translate("Password")}
            name="password"
            type="password"
            autoComplete="name"
            autoFocus
            size="small"
            onChange={e => {
              setPassword({...password, original: e.target.value});
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="new-password"
            label={translate("New Password")}
            type="password"
            id="new-password"
            autoComplete="new-password"
            size="small"
            onChange={e => {
              setPassword({...password, new: e.target.value});
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="check-password"
            label={translate("Check Password")}
            type="password"
            id="check-password"
            autoComplete="current-password"
            size="small"
            onChange={e => {
              setPassword({...password, check: e.target.value});
            }}
          />
          <div
            style={{
              color: "red",
              height: "18px",
              // border: '1px solid black',
              textAlign: "left",
              padding: "0 5px 0 5px",
            }}>
            {alarms}
          </div>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{mt: 2, mb: 2}}
            style={{
              backgroundColor: "#0e1111",
              color: "white",
              paddingTop: "2%",
              textTransform: "none",
            }}>
            {translate("Update")}
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}
