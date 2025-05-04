"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StoreOwnerLayout } from "@/components/layouts/store-owner-layout"
import { RatingUserList } from "@/components/store-owner/rating-user-list"
import { useToast } from "@/components/ui/use-toast"
import { Star, Users } from "lucide-react"

interface StoreData {
  id: number
  name: string
  address: string
  averageRating: number
  totalRatings: number
}

export default function StoreOwnerDashboard() {
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is a store owner
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "store_owner") {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch store data
    const fetchStoreData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3001/api/store-owner/store", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch store data")
        }

        const data = await response.json()
        setStoreData(data)
      } catch (error) {
        console.error("Error fetching store data:", error)
        toast({
          title: "Error",
          description: "Failed to load store data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreData()
  }, [router, toast])

  if (isLoading) {
    return (
      <StoreOwnerLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading store data...</p>
          </div>
        </div>
      </StoreOwnerLayout>
    )
  }

  if (!storeData) {
    return (
      <StoreOwnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Store Found</h2>
            <p className="text-gray-600">
              You don't have a store associated with your account. Please contact an administrator.
            </p>
          </div>
        </div>
      </StoreOwnerLayout>
    )
  }

  return (
    <StoreOwnerLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Store Dashboard</h1>

        {/* Store Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{storeData.name}</h2>
          <p className="text-gray-600 mb-4">{storeData.address}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-3xl font-bold mr-2">{Number(storeData.averageRating).toFixed(1)}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(storeData.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">Based on {storeData.totalRatings} ratings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{storeData.totalRatings}</div>
              <p className="text-xs text-gray-500">Users who rated your store</p>
            </CardContent>
          </Card>
        </div>

        {/* Users who rated the store */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Users Who Rated Your Store</h2>
          <RatingUserList storeId={storeData.id} />
        </div>
      </div>
    </StoreOwnerLayout>
  )
}
