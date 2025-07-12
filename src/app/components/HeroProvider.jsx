"use client"
import { HeroUIProvider } from '@heroui/react'
import React from 'react'

const HeroProvider = ({children}) => {
  return (
    <HeroUIProvider>
        {children}
    </HeroUIProvider>
  )
}

export default HeroProvider