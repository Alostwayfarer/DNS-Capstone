import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { NavBar } from '@/components/nav-bar'

export default function UserDeployments({ params }: { params: { userId: string } }) {
  // This is mock data. In a real application, you would fetch this data from your backend.
  const deployments = [
    { id: '1', name: 'Frontend App', type: 'FRONTEND', status: 'active' },
    { id: '2', name: 'Backend API', type: 'BACKEND', status: 'building' },
    { id: '3', name: 'Python Script', type: 'PYTHON', status: 'error' },
  ]
  const userId = "user123" // Replace with actual user ID from auth


  return (
    <>
              <NavBar userId={userId} />

    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Your Deployments</h1>
        <Button asChild>
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Deployment
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deployments.map((deployment) => (
          <Card key={deployment.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-white">{deployment.name}</CardTitle>
              <CardDescription className="text-gray-400">Type: {deployment.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge 
                  variant={deployment.status === 'active' ? 'default' : deployment.status === 'building' ? 'secondary' : 'destructive'}
                >
                  {deployment.status}
                </Badge>
                <Link 
                  href={`/${params.userId}/${deployment.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View Details →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  )
}

