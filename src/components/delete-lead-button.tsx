'use client'

import React, { useTransition } from 'react'
import { deleteLead } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteLeadButtonProps {
  leadId: string | number
  variant?: 'ghost' | 'outline' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
}

export function DeleteLeadButton({
  leadId,
  variant = 'ghost',
  size = 'sm',
  className = '',
  showText = true,
}: DeleteLeadButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('id', String(leadId))
      await deleteLead(fd)
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} ${variant === 'ghost' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
          disabled={isPending}
        >
          {size === 'icon' ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              {showText && 'Delete'}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the lead
            and all associated data, including quotations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : 'Delete Lead'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
