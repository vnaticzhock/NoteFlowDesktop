import "./Page.scss";

import React from "react";
import {Outlet} from "react-router-dom";

import Prelude from "../../components/TryMe/Prelude.jsx";

const Page = () => {
  return (
    <div className="login">
      <div className="logo">
        <Prelude />
      </div>
      <Outlet />
    </div>
  );
};

export default Page;
