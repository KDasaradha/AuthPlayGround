"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  className?: string
}

export default function BackButton({ 
  href = '/', 
  label = 'Back to Dashboard', 
  variant = 'outline',
  className = ''
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}