"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserLayout } from "@/components/layouts/user-layout"
import { StoreCard } from "@/components/user/store-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"

interface Store {
  id: number
  name: string
  address: string
  averageRating: number
  userRating: number | null
}

export default function UserDashboard() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is a normal user
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "user") {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch stores
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3001/api/stores", {
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

    fetchStores()
  }, [router, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      setFilteredStores(stores)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = stores.filter(
      (store) => store.name.toLowerCase().includes(term) || store.address.toLowerCase().includes(term),
    )

    setFilteredStores(filtered)
  }

  const handleRatingSubmit = async (storeId: number, rating: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, rating }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }

      // Update the store in the list with the new rating
      setStores((prevStores) =>
        prevStores.map((store) => (store.id === storeId ? { ...store, userRating: rating } : store)),
      )

      setFilteredStores((prevStores) =>
        prevStores.map((store) => (store.id === storeId ? { ...store, userRating: rating } : store)),
      )

      toast({
        title: "Rating submitted",
        description: "Your rating has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stores...</p>
          </div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Stores</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="Search by store name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {/* Store List */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No stores found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onRatingSubmit={(rating) => handleRatingSubmit(store.id, rating)}
              />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
