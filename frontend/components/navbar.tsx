"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FaGithub, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, userData, logout } = useAuth();
  const router = useRouter();
  
  // Don't render navbar on the homepage
  if (pathname === '/' || pathname === '/demo' || pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const isActive = pathname === href;
    
    return (
      <Link 
        href={href}
        className={`px-3 py-2 text-sm font-medium rounded-md ${
          isActive 
            ? "bg-blue-50 text-blue-700" 
            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
        } transition-colors`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                Resume<span className="text-blue-700">Tailor</span>
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {isLoggedIn ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  {/* <NavLink href="/dashboard/github">GitHub Projects</NavLink> */}
                  <NavLink href="/resumes">My Resumes</NavLink>
                  <NavLink href="/templates">Templates</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/templates">Templates</NavLink>
                  <NavLink href="/pricing">Pricing</NavLink>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative rounded-full"
                    aria-label="User menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                      <FaUser className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                    {userData?.name || "User"}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {userData?.email || ""}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-700">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {isLoggedIn ? (
            <>
              <Link 
                href="/dashboard"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/dashboard'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              {/* <Link 
                href="/dashboard/github"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/dashboard/github'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                GitHub Projects
              </Link> */}
              <Link 
                href="/resumes"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/resumes'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                My Resumes
              </Link>
              <Link 
                href="/templates"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/templates'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                Templates
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/templates"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/templates'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                Templates
              </Link>
              <Link 
                href="/pricing"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === '/pricing'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={toggleMenu}
              >
                Pricing
              </Link>
            </>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isLoggedIn ? (
            <div>
              <div className="flex items-center px-4">
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white">
                  <FaUser className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userData?.name || "User"}</div>
                  <div className="text-sm font-medium text-gray-500">{userData?.email || ""}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link 
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link 
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  onClick={toggleMenu}
                >
                  Settings
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 space-y-2">
              <Link 
                href="/login"
                className="block w-full text-center px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-700 border border-gray-300 rounded-md hover:bg-blue-50"
                onClick={toggleMenu}
              >
                Log in
              </Link>
              <Link 
                href="/signup"
                className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md"
                onClick={toggleMenu}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
