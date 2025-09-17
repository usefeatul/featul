"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@feedgot/ui/components/button"
import { Badge } from "@feedgot/ui/components/badge"
import { GoogleIcon } from '@feedgot/ui/icons/google';
import GitHubIcon from '@feedgot/ui/icons/github';

export function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null)

  useEffect(() => {
    // Get the last used login method when component mounts
    const lastMethod = authClient.getLastUsedLoginMethod()
    setLastUsedMethod(lastMethod)
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      setError("Failed to sign in with GitHub")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background">
      {/* Logo in top-left corner */}
      <div className="absolute top-6 left-6">
        <img src="/logo.svg" alt="Feedgot" className="h-8 w-auto" />
      </div>
      
      {/* Main content */}
       <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
         <div className="w-full max-w-sm space-y-8">
           <div className="text-center">
             <h1 className="text-4xl font-bold tracking-tight text-foreground">
               Welcome back
             </h1>
             <p className="mt-3 text-base text-muted-foreground">
               Sign in to your Feedgot account
             </p>
           </div>
           
           <div className="mt-8 space-y-6">
             {error && (
               <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                 {error}
               </div>
             )}
             
             <div className="space-y-3 flex flex-col items-center">
                <div className="relative">
                  <Button
                    variant={lastUsedMethod === "google" ? "default" : "outline"}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`w-64 h-10 text-sm font-medium border-2 transition-colors ${
                      lastUsedMethod === "google" 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    {isLoading ? "Signing in..." : "Continue with Google"}
                  </Button>
                  {lastUsedMethod === "google" && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs px-2 py-0.5"
                    >
                      Last used
                    </Badge>
                  )}
                </div>
                
                <div className="relative">
                  <Button
                    variant={lastUsedMethod === "github" ? "default" : "outline"}
                    onClick={handleGithubSignIn}
                    disabled={isLoading}
                    className={`w-64 h-10 text-sm font-medium border-2 transition-colors ${
                      lastUsedMethod === "github" 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <GitHubIcon className="mr-2 h-4 w-4" />
                    {isLoading ? "Signing in..." : "Continue with GitHub"}
                  </Button>
                  {lastUsedMethod === "github" && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs px-2 py-0.5"
                    >
                      Last used
                    </Badge>
                  )}
                </div>
              </div>
           </div>
         </div>
       </div>
      
      {/* Terms and Privacy Policy */}
      <div className="pb-6 px-4 text-center">
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          By clicking "Continue with Google" or "Continue with GitHub", you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground transition-colors">
            Terms of Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}