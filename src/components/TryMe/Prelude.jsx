import React, {useEffect, useState} from "react";
import {CSSTransition, SwitchTransition} from "react-transition-group";

import TryMe from "./TryMe";

const Prelude = () => {
  const [showLogo, setShowLogo] = useState(false);
  const [showTryMe, setShowTryMe] = useState(false); // 切換 logo 以及 tryme

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowLogo(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setShowTryMe(true);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={showLogo ? "logo" : "tryme"}
        classNames="fade"
        timeout={500}>
        {showLogo ? (
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={showTryMe ? "tryme" : "h1"}
              classNames="fade"
              timeout={500}>
              {showTryMe ? <TryMe /> : <h1>Try Me</h1>}
            </CSSTransition>
          </SwitchTransition>
        ) : (
          <div>
            <img
              loading="lazy"
              src="assets/logo.png"
              width={"200"}
              height={"200"}
            />
            <h1 className="noteflow-title">NoteFlow</h1>
          </div>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
};

export default Prelude;
