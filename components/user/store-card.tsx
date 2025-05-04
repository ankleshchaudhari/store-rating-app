"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"

interface Store {
  id: number
  name: string
  address: string
  averageRating: number
  userRating: number | null
}

interface StoreCardProps {
  store: Store
  onRatingSubmit: (rating: number) => void
}

export function StoreCard({ store, onRatingSubmit }: StoreCardProps) {
  const [isRating, setIsRating] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const handleRatingClick = (rating: number) => {
    onRatingSubmit(rating)
    setIsRating(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{store.name}</CardTitle>
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{store.address}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Overall Rating</div>
            <div className="flex items-center">
              
            <span className="text-lg font-bold mr-2">
            {Number(store.averageRating || 0).toFixed(1)}
            </span>

              
              
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(store.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Your Rating</div>
            {isRating ? (
              <div className="flex flex-col space-y-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingClick(star)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsRating(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {store.userRating ? (
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">{store.userRating}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= store.userRating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Not rated yet</span>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsRating(true)}>
                  {store.userRating ? "Change Rating" : "Rate Store"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
