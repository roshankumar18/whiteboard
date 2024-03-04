import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Share from "./components/Share";
import Drawing from "./components/Drawing/Drawing";
import App from "./App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/share/:id" element={<Share />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
