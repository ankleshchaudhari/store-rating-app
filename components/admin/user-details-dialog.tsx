"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  address: string
  role: string
  rating?: number
}

interface UserDetailsDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Detailed information about the user</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500">Name</h4>
            <p className="text-sm">{user.name}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="text-sm">{user.email}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500">Address</h4>
            <p className="text-sm">{user.address}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500">Role</h4>
            <p className="text-sm">
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
            </p>
          </div>

          {user.role === "store_owner" && user.rating !== undefined && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Store Rating</h4>
              <div className="flex items-center">
                <span className="mr-2">{user.rating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(user.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
