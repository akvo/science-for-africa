import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>SFA Design System | Style Guide</title>
      </Head>

      <nav className="border-b border-brand-gray-100 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-brand-teal-900">
            <span className="text-2xl">SFA</span>
            <span className="text-brand-gray-400">/</span>
            <span>Design System</span>
          </div>
          <Badge variant="primary" size="sm">v1.3 Expanded</Badge>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 space-y-24">
        {/* Hero Section */}
        <header className="max-w-3xl space-y-4">
          <h1 className="text-display-lg text-brand-teal-900 uppercase">
            Brand Expansion v2
          </h1>
          <p className="text-xl text-brand-gray-600">
            Phase 3: Avatars, Cards, and Modals refined for Science for Africa.
          </p>
        </header>

        {/* 01. Form Elements */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">01. Form Elements & Typography</h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Inputs & Selection</CardTitle>
                <CardDescription>Consistent typography and premium 48px height.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="olivia@untitledui.com" />
                </div>
                <div className="space-y-2">
                  <Label>Country Selector (Heading Font applied)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ke">Kenya</SelectItem>
                      <SelectItem value="ug">Uganda</SelectItem>
                      <SelectItem value="tz">Tanzania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selection Controls</CardTitle>
                <CardDescription>Brand Teal active states with 8px/full radii.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-lg">
                  <Label className="text-base">Push Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">Agree to Terms</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 02. Premium UI Elements */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">02. Premium UI Elements</h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avatars */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Avatar Scale</CardTitle>
                <CardDescription>Brand sizes from XS (24px) to 2XL (64px).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-6">
                  {["xs", "sm", "md", "lg", "xl", "2xl"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <Avatar size={s}>
                        <AvatarFallback>{s.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-mono text-brand-gray-400">{s}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-mono text-brand-gray-400">image</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modals */}
            <Card>
              <CardHeader>
                <CardTitle>Dialogs & Modals</CardTitle>
                <CardDescription>Refined for SFA with 16px radius.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Open Modal Example</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Profile Information</DialogTitle>
                      <DialogDescription>
                        Update your researcher profile and affiliation details here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input defaultValue="Dr. Olivia Rhye" />
                      </div>
                    </div>
                    <DialogFooter showCloseButton>
                      <Button variant="primary">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Card Layouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="border-b mb-4">
                <CardTitle>Community Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    <AvatarFallback>RD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-brand-gray-900">Research & Dev</h4>
                    <p className="text-xs text-brand-gray-500">1.2k Members</p>
                  </div>
                </div>
                <p className="text-sm text-brand-gray-600 line-clamp-2">
                  Exploring new frontiers in African science and technology collaboration.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Join Community</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b mb-4">
                <CardTitle>Event Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">Upcoming</Badge>
                  <span className="text-xs font-bold text-brand-orange-500 uppercase">24 Mar 2026</span>
                </div>
                <h4 className="font-bold text-brand-gray-900 text-lg">Science Summit 2026</h4>
                <p className="text-sm text-brand-gray-600">
                  Join leading scientists in Nairobi for the annual SFA summit.
                </p>
              </CardContent>
              <CardFooter className="bg-brand-gray-50">
                <Button className="w-full">Register Now</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 03. Metadata & Navigation */}
        <section className="space-y-12 pb-24">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">03. Metadata & Menus</h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="space-y-4">
              <Label className="text-brand-gray-400 uppercase text-[10px] tracking-widest">Badges</Label>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="error" size="lg">Error LG</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-brand-gray-400 uppercase text-[10px] tracking-widest">Dropdown Menu</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Action Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem>Member Directory</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-teal-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">Science for Africa</div>
          <p className="text-brand-teal-100 mb-8 max-w-md mx-auto">
            Design System Phase 3: Verified for Avatars, Cards, and Modals.
          </p>
          <div className="text-xs font-mono text-brand-teal-200">
            SFA-SYSTEM-V1.3-REF
          </div>
        </div>
      </footer>
    </div>
  );
}
