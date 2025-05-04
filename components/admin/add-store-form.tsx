"use client"

import type React from "react"
import { useEffect, useState } from "react"

//import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  name: string
  email: string
}

export function AddStoreForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  })
  const [storeOwners, setStoreOwners] = useState<User[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOwners, setIsLoadingOwners] = useState(true)
  const { toast } = useToast()

  // Fetch store owners on component mount
  useEffect(() => {
    const fetchStoreOwners = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:3001/api/admin/store-owners", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch store owners")
        }

        const data = await response.json()
        setStoreOwners(data)
      } catch (error) {
        console.error("Error fetching store owners:", error)
        toast({
          title: "Error",
          description: "Failed to load store owners",
          variant: "destructive",
        })
      } finally {
        setIsLoadingOwners(false)
      }
    }

    fetchStoreOwners()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation: Min 20 characters, Max 60 characters
    if (formData.name.length < 20) {
      newErrors.name = "Name must be at least 20 characters"
    } else if (formData.name.length > 60) {
      newErrors.name = "Name must be less than 60 characters"
    }

    // Address validation: Max 400 characters
    if (formData.address.length > 400) {
      newErrors.address = "Address must be less than 400 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Owner validation
    if (!formData.ownerId) {
      newErrors.ownerId = "Please select a store owner"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOwnerChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ownerId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/admin/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add store")
      }

      toast({
        title: "Success",
        description: "Store has been added successfully",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        address: "",
        ownerId: "",
      })
    } catch (error) {
      console.error("Error adding store:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add store",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Store</CardTitle>
        <CardDescription>Create a new store with the following details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter store name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Store Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="store@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Store Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter store address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Store Owner</Label>
            <Select value={formData.ownerId} onValueChange={handleOwnerChange} disabled={isLoadingOwners}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingOwners ? "Loading owners..." : "Select store owner"} />
              </SelectTrigger>
              <SelectContent>
                {storeOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id.toString()}>
                    {owner.name} ({owner.email})
                  </SelectItem>
                ))}
                {storeOwners.length === 0 && !isLoadingOwners && (
                  <SelectItem value="none" disabled>
                    No store owners available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.ownerId && <p className="text-sm text-red-500">{errors.ownerId}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isLoadingOwners}>
            {isLoading ? "Adding Store..." : "Add Store"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
