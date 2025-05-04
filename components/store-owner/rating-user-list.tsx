"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ChevronUp, ChevronDown, Search, Star } from "lucide-react"

interface RatingUser {
  id: number
  name: string
  email: string
  rating: number
  ratedAt: string
}

interface RatingUserListProps {
  storeId: number
}

export function RatingUserList({ storeId }: RatingUserListProps) {
  const [users, setUsers] = useState<RatingUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<RatingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof RatingUser>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  useEffect(() => {
    fetchRatingUsers()
  }, [storeId])

  const fetchRatingUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/store-owner/ratings/${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch rating users")
      }

      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error fetching rating users:", error)
      toast({
        title: "Error",
        description: "Failed to load users who rated your store",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof RatingUser) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[field] < b[field]) return newDirection === "asc" ? -1 : 1
      if (a[field] > b[field]) return newDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredUsers(sorted)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      setFilteredUsers(users)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = users.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    )

    setFilteredUsers(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const SortIcon = ({ field }: { field: keyof RatingUser }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                <div className="flex items-center">
                  Email
                  <SortIcon field="email" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                <div className="flex items-center">
                  Rating
                  <SortIcon field="rating" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("ratedAt")}>
                <div className="flex items-center">
                  Rated On
                  <SortIcon field="ratedAt" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No users have rated your store yet
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-2">{user.rating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= user.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.ratedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
