"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { MoreHorizontal, ChevronUp, ChevronDown, Search } from "lucide-react"
import { UserDetailsDialog } from "./user-details-dialog"

interface User {
  id: number
  name: string
  email: string
  address: string
  role: string
  rating?: number
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof User>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof User) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = a[field] ?? (typeof a[field] === "number" ? 0 : "")
      const bValue = b[field] ?? (typeof b[field] === "number" ? 0 : "")
    
      if (aValue < bValue) return newDirection === "asc" ? -1 : 1
      if (aValue > bValue) return newDirection === "asc" ? 1 : -1
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
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.address.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term),
    )

    setFilteredUsers(filtered)
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const SortIcon = ({ field }: { field: keyof User }) => {
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
            placeholder="Search by name, email, address, or role..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort("address")}>
                <div className="flex items-center">
                  Address
                  <SortIcon field="address" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                <div className="flex items-center">
                  Role
                  <SortIcon field="role" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{user.address}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "store_owner"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : user.role === "store_owner" ? "Store Owner" : "User"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit user</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete user</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && <UserDetailsDialog user={selectedUser} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />}
    </div>
  )
}
