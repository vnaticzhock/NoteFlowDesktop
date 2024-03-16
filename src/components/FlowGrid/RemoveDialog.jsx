import React, {useEffect, useState} from "react";

import {useLanguage} from "../../providers/i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Slide,
} from "../Common/Mui.jsx";
import {Transition} from "./FlowGrid.jsx";

const RemoveDialog = ({isVisible, setIsVisible, focus, flows, submit}) => {
  const {translate} = useLanguage();

  return (
    <Dialog
      open={isVisible}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setIsVisible(false)}>
      <DialogTitle>
        {translate("Do you want to delete the flow ") +
          flows[focus].title +
          "?"}
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setIsVisible(false)}>
          {translate("Cancel")}
        </Button>
        <Button
          onClick={() => {
            submit();
            setIsVisible(false);
          }}>
          {translate("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveDialog;
