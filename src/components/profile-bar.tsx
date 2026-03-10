'use client'

import { useState, useRef, useEffect } from 'react'
import { logout } from '@/app/actions/auth'
import {
  IconUser,
  IconBell,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react'
import Link from 'next/link'

interface ProfileBarProps {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function hashColor(str: string): string {
  // Deterministic gradient color from name string
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  }
  const hue = Math.abs(h) % 360
  return `hsl(${hue}, 65%, 45%)`
}

export function ProfileBar({ user }: ProfileBarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const initials = getInitials(user.name || user.email)
  const avatarColor = hashColor(user.name || user.email)

  return (
    <div className="profile-bar-wrap" ref={ref}>
      {/* Notification bell */}
      <button
        type="button"
        className="profile-bell-btn"
        aria-label="Notifications"
      >
        <IconBell className="h-5 w-5" />
        <span className="profile-bell-dot" aria-hidden="true" />
      </button>

      {/* Avatar trigger */}
      <button
        type="button"
        id="profile-menu-btn"
        className="profile-avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open user menu"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="profile-avatar-img"
          />
        ) : (
          <span
            className="profile-avatar-initials"
            style={{ background: avatarColor }}
          >
            {initials || <IconUser className="h-4 w-4" />}
          </span>
        )}

        <div className="profile-name-wrap">
          <span className="profile-name">{user.name || 'My Account'}</span>
          <span className="profile-email">{user.email}</span>
        </div>

        <IconChevronDown
          className="profile-chevron"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="profile-dropdown" role="menu" aria-label="User menu">
          {/* Header */}
          <div className="profile-dropdown-header">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="profile-dropdown-avatar"
              />
            ) : (
              <span
                className="profile-dropdown-avatar profile-dropdown-initials"
                style={{ background: avatarColor }}
              >
                {initials}
              </span>
            )}
            <div className="profile-dropdown-info">
              <span className="profile-dropdown-name">{user.name || 'My Account'}</span>
              <span className="profile-dropdown-email">{user.email}</span>
            </div>
          </div>

          <div className="profile-dropdown-divider" />

          {/* Menu items */}
          <Link
            href="/dashboard/settings"
            className="profile-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <IconSettings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          <div className="profile-dropdown-divider" />

          {/* Logout */}
          <form
            action={logout}
            className="w-full"
            onSubmit={() => setOpen(false)}
          >
            <button
              type="submit"
              className="profile-dropdown-item profile-dropdown-logout"
              role="menuitem"
            >
              <IconLogout className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
