import Link from 'next/link'
import { LogoutButton } from './logout-button'

export function NavBar({ userId }: { userId: string }) {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={`/${userId}`} className="text-xl font-bold">DNS Hosting</Link>
        <div className="space-x-4">
          <Link href={`/${userId}`} className="hover:text-blue-300">Deployments</Link>
          {/* <Link href="/settings" className="hover:text-blue-300">Settings</Link> */}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

