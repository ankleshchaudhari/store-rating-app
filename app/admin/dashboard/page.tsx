"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { UserList } from "@/components/admin/user-list"
import { StoreList } from "@/components/admin/store-list"
import { AddUserForm } from "@/components/admin/add-user-form"
import { AddStoreForm } from "@/components/admin/add-store-form"
import { useToast } from "@/components/ui/use-toast"
import { Users, Store, Star } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is an admin
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3001/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router, toast])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500">Registered users on the platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStores}</div>
              <p className="text-xs text-gray-500">Registered stores on the platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              <Star className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRatings}</div>
              <p className="text-xs text-gray-500">Ratings submitted by users</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="add-user">Add User</TabsTrigger>
            <TabsTrigger value="add-store">Add Store</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserList />
          </TabsContent>

          <TabsContent value="stores" className="space-y-4">
            <StoreList />
          </TabsContent>

          <TabsContent value="add-user" className="space-y-4">
            <AddUserForm />
          </TabsContent>

          <TabsContent value="add-store" className="space-y-4">
            <AddStoreForm />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
