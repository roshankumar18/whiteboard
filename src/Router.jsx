import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import Share from './components/Share'

const Router = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<App/>}/>
          <Route path='/share/:id' element={<Share/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default Router