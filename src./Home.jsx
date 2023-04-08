import React from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Card from './components/Card/Card'
import Cities from './components/Cities/Cities'
import CTA from './components/CTA/CTA'
import AccContainer from './components/AccContainer/AccContainer'
// import Accordian from './components/Accordian/Accordian'
import Collection from './components/Collections/Collection'

import {BrowserRouter as Routes,Links,Route, BrowserRouter} from 'react-router-dom'
const Home = () => {
  return (
    <BrowserRouter>
    
      <Header />
       <Card />
      <Collection />
      <Cities />
      <CTA />
      <AccContainer />
      <Footer /> 
    </BrowserRouter>
  )
}

export default Home