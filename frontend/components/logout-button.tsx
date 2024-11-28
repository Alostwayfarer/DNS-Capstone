'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    // Implement logout logic here
    console.log('Logging out')
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000))
    // After successful logout, redirect to home page
    router.push('/')
  }

  return (
    <Button onClick={handleLogout} variant="outline" className="bg-gray-800 text-white hover:bg-gray-700" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </Button>
  )
}

