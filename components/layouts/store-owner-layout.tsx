"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Store, LogOut, User, Menu, BarChart3, Settings } from "lucide-react"

interface StoreOwnerLayoutProps {
  children: React.ReactNode
}

export function StoreOwnerLayout({ children }: StoreOwnerLayoutProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-6 w-6" />
            <span className="font-bold text-xl">StoreRater</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/store-owner/dashboard" className="text-gray-700 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/store-owner/settings" className="text-gray-700 hover:text-gray-900">
            Settings
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 rounded-full flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/store-owner/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <nav className="flex flex-col py-2">
            <Link
              href="/store-owner/dashboard"
              className="px-6 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link
              href="/store-owner/settings"
              className="px-6 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
            </Link>
            <button
              className="px-6 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
