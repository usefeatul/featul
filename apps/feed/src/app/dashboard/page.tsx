import React from 'react'
import type { Metadata } from 'next'

const Homepage = () => {
  return (
    <div className="">
      hello there dashboard
    </div>
  )
}

export default Homepage

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your projects in Feedgot.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
}
