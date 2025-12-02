import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">My Account</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences.</p>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Hassan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="hassan@example.com" disabled />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password for better security.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
