'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Github, Loader2, CheckCircle, XCircle, ShieldCheck, List, LogOut, Sun, Moon } from 'lucide-react'

// Theme context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

// Theme provider component
import { ReactNode } from 'react';

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme
function useTheme() {
  return useContext(ThemeContext)
}

// Login and Create Account Page Component
function LoginPage({ setLoggedIn }: { setLoggedIn: (loggedIn: boolean) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [accounts, setAccounts] = useState([{ username: 'admin', password: 'password', name: 'Admin User' }])

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const account = accounts.find(acc => acc.username === username && acc.password === password)
    if (account) {
      setLoggedIn(true)
    } else {
      alert('Invalid credentials')
    }
  }

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (accounts.some(acc => acc.username === username)) {
      alert('Username already exists')
      return
    }
    setAccounts([...accounts, { username, password, name }])
    setIsCreatingAccount(false)
    alert('Account created successfully! You can now log in.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isCreatingAccount ? 'Create Account' : 'Login'}
          </CardTitle>
          <CardDescription className="text-center">
            {isCreatingAccount
              ? 'Enter your details to create a new account'
              : 'Enter your credentials to access the dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreatingAccount ? (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Login
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full"
            onClick={() => {
              setIsCreatingAccount(!isCreatingAccount)
              setUsername('')
              setPassword('')
              setName('')
            }}
          >
            {isCreatingAccount ? 'Back to Login' : 'Create an Account'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// GitHub Link Submission Page Component
function GitHubLinkPage({ setWebsiteLogs }: { setWebsiteLogs: React.Dispatch<React.SetStateAction<{ id: number, message: string, timestamp: string }[]>> }) {
  const [githubLink, setGithubLink] = useState('')
  const [isHosting, setIsHosting] = useState(false)
  const [hostingSteps, setHostingSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsHosting(true)
    setHostingSteps([])
    setError(null)

    try {
      await simulateHosting(githubLink)
      setHostingSteps(prev => [...prev, 'Hosting completed successfully!'])
      // Generate some sample logs for the hosted website
      const newLogs = [
        { id: Date.now(), message: 'Website deployed successfully', timestamp: new Date().toLocaleString() },
        { id: Date.now() + 1, message: 'First user visit', timestamp: new Date(Date.now() + 60000).toLocaleString() },
        { id: Date.now() + 2, message: 'Config file updated', timestamp: new Date(Date.now() + 120000).toLocaleString() },
      ]
      setWebsiteLogs(newLogs)
    } catch (err) {
      setError('An error occurred during the hosting process. Please check your GitHub link and try again.')
    } finally {
      setIsHosting(false)
    }
  }

  const simulateHosting = async (link: string) => {
    const steps = [
      'Validating GitHub link...',
      'Cloning repository...',
      'Installing dependencies...',
      'Building project...',
      'Configuring server...',
      'Deploying to CDN...',
    ]

    for (const step of steps) {
      setHostingSteps(prev => [...prev, step])
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    if (Math.random() < 0.3) {
      throw new Error('Random error occurred')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg dark:from-blue-800 dark:to-purple-800">
        <CardTitle className="text-2xl font-bold">Host Your GitHub Project</CardTitle>
        <CardDescription className="text-blue-100 dark:text-blue-200">Enter your GitHub repository link to start hosting your website.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://github.com/username/repository"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              required
              className="flex-grow"
            />
            <Button type="submit" disabled={isHosting} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
              {isHosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hosting...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Host
                </>
              )}
            </Button>
          </div>
        </form>

        {hostingSteps.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Hosting Progress:</h3>
            <ul className="space-y-2">
              {hostingSteps.map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  {index === hostingSteps.length - 1 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Logs and Security Page Component
function LogsAndSecurityPage({ websiteLogs }: { websiteLogs: { id: number, message: string, timestamp: string }[] }) {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg dark:from-blue-800 dark:to-purple-800">
        <CardTitle className="text-2xl font-bold">Logs and Security</CardTitle>
        <CardDescription className="text-blue-100 dark:text-blue-200">View website activities and manage security settings.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Website Logs</h3>
          {websiteLogs.length > 0 ? (
            <ul className="space-y-2">
              {websiteLogs.map((log) => (
                <li key={log.id} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <List className="h-4 w-4 text-blue-500" />
                  <span>{log.message} - {log.timestamp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No logs available. Host a website to see logs here.</p>
          )}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Security Settings</h3>
          <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Enable Two-Factor Authentication
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main App Component
export function GithubHosting() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [websiteLogs, setWebsiteLogs] = useState<{ id: number, message: string, timestamp: string }[]>([])
  const { theme, toggleTheme } = useTheme()

  return (
    <Router>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 min-h-screen">
          {loggedIn && (
            <nav className="bg-white dark:bg-gray-800 shadow-md p-4">
              <div className="container mx-auto flex justify-between items-center">
                <div className="flex space-x-4">
                  <Link to="/github-link" className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300">GitHub Link</Link>
                  <Link to="/logs-security" className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300">Logs & Security</Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={toggleTheme} variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => setLoggedIn(false)} variant="outline" className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </nav>
          )}
          
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/login" element={
                loggedIn ? <Navigate to="/github-link" /> : <LoginPage setLoggedIn={setLoggedIn} />
              } />
              <Route path="/github-link" element={
                loggedIn ? <GitHubLinkPage setWebsiteLogs={setWebsiteLogs} /> : <Navigate to="/login" />
              } />
              <Route path="/logs-security" element={
                loggedIn ? <LogsAndSecurityPage websiteLogs={websiteLogs} /> : <Navigate to="/login" />
              } />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

// Wrap the main component with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <GithubHosting />
    </ThemeProvider>
  )
}

export default App;