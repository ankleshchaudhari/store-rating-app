import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">StoreRater</h1>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Rate Your Favorite Stores</h2>
          <p className="text-xl text-gray-600">
            Join our platform to discover and rate stores in your area. Share your experiences and help others make
            informed decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>For Customers</CardTitle>
              <CardDescription>Rate and review your shopping experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>Find stores near you</li>
                <li>Submit ratings from 1 to 5</li>
                <li>See average ratings from other users</li>
                <li>Update your ratings anytime</li>
              </ul>
              <Button className="w-full mt-4" asChild>
                <Link href="/register?role=User">Customer Register</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Store Owners</CardTitle>
              <CardDescription>Monitor your store's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>View your store's average rating</li>
                <li>See who rated your store</li>
                <li>Track rating trends over time</li>
                <li>Improve based on customer feedback</li>
              </ul>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href="/register?role=store_owner">Store-Owner Register</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Administrators</CardTitle>
              <CardDescription>Manage the entire platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-gray-600">
                <li>Add new stores to the platform</li>
                <li>Manage users and their roles</li>
                <li>View comprehensive statistics</li>
                <li>Ensure platform integrity</li>
              </ul>
              <Button className="w-full mt-4" variant="secondary" asChild>
                <Link href="/register?role=admin">Admin Register</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">StoreRater</h2>
              <p className="text-sm">Your trusted platform for store ratings</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} StoreRater. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}