'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'

export default function DeploymentPage({ params }: { params: { userId: string, deploymentId: string } }) {
  const [activeTab, setActiveTab] = useState('info')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    // Implement delete logic here
    console.log(`Deleting deployment ${params.deploymentId}`)
    // Simulate deletion process
    await new Promise(resolve => setTimeout(resolve, 2000))
    // After successful deletion, redirect to user's main page
    router.push(`/${params.userId}`)
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Deployment: {params.deploymentId}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="info" className="data-[state=active]:bg-blue-600">Info</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">Security</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-blue-600">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Deployment Info</CardTitle>
              <CardDescription className="text-gray-400">Details about your deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-300">
              <p>GitHub Link: <a href="https://github.com/username/repo" className="text-blue-400 hover:underline">https://github.com/username/repo</a></p>
              <p>Subdomain: <span className="font-mono">example.dnshosting.com</span></p>
              <p>Deployment Type: <Badge variant="outline">Frontend</Badge></p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">Delete Deployment</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      This action cannot be undone. This will permanently delete your deployment and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Security Details</CardTitle>
              <CardDescription className="text-gray-400">Security information for your deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>SSL: <Badge variant="success">Enabled</Badge></li>
                <li>Last security scan: 2 days ago</li>
                <li>Vulnerabilities detected: <Badge variant="success">None</Badge></li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Deployment Logs</CardTitle>
              <CardDescription className="text-gray-400">Recent activity logs for your deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Badge variant="success" className="mr-2">Success</Badge>
                  Deployment successful (2 hours ago)
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Info</Badge>
                  Build started (2 hours ago)
                </li>
                <li className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Info</Badge>
                  Code pushed to repository (2 hours ago)
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <Link href={`/${params.userId}`} className="text-blue-400 hover:text-blue-300">← Back to All Deployments</Link>
      </div>
    </div>
  )
}

