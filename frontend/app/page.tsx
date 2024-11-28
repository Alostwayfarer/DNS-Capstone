import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">DNS Hosting</CardTitle>
          <CardDescription className="text-gray-400">Deploy your project in seconds</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-link" className="text-gray-200">GitHub Link</Label>
              <Input id="github-link" placeholder="https://github.com/username/repo" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deployment-type" className="text-gray-200">Deployment Type</Label>
              <Select>
                <SelectTrigger id="deployment-type" className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select deployment type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="FRONTEND">Frontend</SelectItem>
                  <SelectItem value="BACKEND">Backend</SelectItem>
                  <SelectItem value="PYTHON">Python</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Deploy</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 space-x-4">
        <Link href="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        <Link href="/signup" className="text-blue-400 hover:text-blue-300">Sign Up</Link>
      </div>
    </div>
  )
}

