import React from 'react'
import { MoonLoader } from 'react-spinners'

export default function Loading() {
  return (
    <div className='flex items-center  justify-center h-screen'>
        <MoonLoader />
    </div>
  )
}
