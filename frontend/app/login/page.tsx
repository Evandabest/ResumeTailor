"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { linkGitHubAccount } from "@/lib/github"
import { FaGithub } from "react-icons/fa"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth()  
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  
  // Signup form state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      const userData = {
        name: loginEmail.split('@')[0], // Default name from email
        email: loginEmail
      };
      login(userData);
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error);
      setError('Failed to connect to authentication service');
    } finally {
      setIsLoading(false)
    }
  }
  
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (signupPassword !== signupConfirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      const userData = {
        name: signupName,
        email: signupEmail
      };
      login(userData);
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup failed:", error);
      setError('Failed to connect to authentication service');
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold">
              Resume<span className="text-blue-700">Tailor</span>
            </h1>
          </Link>
          <p className="mt-2 text-gray-600">
            Tailor your resume to land your dream job
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {error && (
                <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-blue-700 hover:text-blue-600">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>

                <div className="relative my-6">
                  <Separator className="absolute inset-0 m-auto" />
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const githubData = await linkGitHubAccount();
                      login({
                        name: 'GitHub User',
                        email: 'github@user.com'
                      });
                      router.push('/dashboard');
                    } catch (error) {
                      setError(error instanceof Error ? error.message : 'GitHub authentication failed');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  GitHub
                </Button>

              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {error && (
                <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="relative my-6">
                  <Separator className="absolute inset-0 m-auto" />
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const githubData = await linkGitHubAccount();
                      login({
                        name: 'GitHub User',
                        email: 'github@user.com'
                      });
                      router.push('/dashboard');
                    } catch (error) {
                      setError(error instanceof Error ? error.message : 'GitHub authentication failed');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  GitHub
                </Button>

              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          By using ResumeTailor, you agree to our{" "}
          <Link href="/terms" className="text-blue-700 hover:text-blue-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-700 hover:text-blue-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
