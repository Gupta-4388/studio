
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = (action: 'Sign In' | 'Sign Up') => {
    // In a real app, you'd handle auth here.
    // For this prototype, we'll just navigate to the dashboard.
    toast({
      title: action === 'Sign In' ? 'Signed In' : 'Account Created',
      description: `Welcome! You have been successfully ${action === 'Sign In' ? 'signed in' : 'signed up'}.`,
    });
    router.push('/dashboard');
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center px-0">
        <CardTitle>Welcome to PathFinder AI</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Tabs defaultValue="sign-in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" />
              </div>
              <Button className="w-full" onClick={() => handleAuthAction('Sign In')}>
                Sign In
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="sign-up">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name-signup">Name</Label>
                <Input id="name-signup" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" />
              </div>
              <Button className="w-full" onClick={() => handleAuthAction('Sign Up')}>
                Sign Up
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
