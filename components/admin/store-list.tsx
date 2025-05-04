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
import { MoreHorizontal, ChevronUp, ChevronDown, Search, Star } from "lucide-react"

interface Store {
  id: number
  name: string
  email: string
  address: string
  rating: number
}

export function StoreList() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Store>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/stores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stores")
      }

      const data = await response.json()
      setStores(data)
      setFilteredStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Store) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...filteredStores].sort((a, b) => {
      if (a[field] < b[field]) return newDirection === "asc" ? -1 : 1
      if (a[field] > b[field]) return newDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredStores(sorted)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      setFilteredStores(stores)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(term) ||
        store.email.toLowerCase().includes(term) ||
        store.address.toLowerCase().includes(term),
    )

    setFilteredStores(filtered)
  }

  const SortIcon = ({ field }: { field: keyof Store }) => {
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
            placeholder="Search by name, email, or address..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                <div className="flex items-center">
                  Rating
                  <SortIcon field="rating" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No stores found
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{store.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                    <span className="mr-2">{Number(store.rating).toFixed(1)}</span>

                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(store.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit store</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete store</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
