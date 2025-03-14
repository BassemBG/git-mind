'use client'

import { useUser } from '@clerk/nextjs'
import React from 'react'

function DashboardPage() {
    const { user } = useUser();
  return (
    <div>Welcome { user?.firstName + " " + user?.lastName} </div>
  )
}

export default DashboardPage