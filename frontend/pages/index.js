import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { SocialAuth, SocialButton } from "@/components/auth/social-auth";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function StyleGuide() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-white">
      <Meta title={t("seo.home_title")} />

      <nav className="border-b border-brand-gray-100 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-brand-teal-900">
            <span className="text-2xl">SFA</span>
            <span className="text-brand-gray-400">/</span>
            <span>Design System</span>
          </div>
          <Badge variant="primary" size="sm">
            Components
          </Badge>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 space-y-24">
        {/* Hero Section */}
        <header className="max-w-3xl space-y-4">
          <h1 className="text-display-lg text-brand-teal-900 uppercase">
            Brand Expansion
          </h1>
          <p className="text-xl text-brand-gray-600">
            Official Button System, Avatars, Cards, and Modals.
          </p>
        </header>

        {/* 01. Button System */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              00. Official Button System
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Standard Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Sizes (Figma Scale)</CardTitle>
                <CardDescription>
                  SM to 2XL with precise heights and padding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-wrap items-end gap-4">
                  {["sm", "md", "lg", "xl", "2xl"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <Button size={s}>Button {s.toUpperCase()}</Button>
                      <span className="text-[10px] font-mono text-brand-gray-400">
                        {s === "sm"
                          ? "34px"
                          : s === "md" || s === "lg"
                            ? "38px"
                            : s === "xl"
                              ? "46px"
                              : "56px"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  {["icon-sm", "icon-md", "icon-lg", "icon-xl", "icon-2xl"].map(
                    (s) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <Button
                          variant="outline"
                          size={s}
                          className="rounded-full"
                        >
                          <svg
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </Button>
                        <span className="text-[10px] font-mono text-brand-gray-400">
                          {s.split("-")[1]}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Social Authentication</CardTitle>
                <CardDescription>
                  Dedicated variant for Google and Apple sign-in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-sm mx-auto p-6 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                  <h4 className="text-sm font-bold text-brand-gray-700 mb-6 text-center uppercase tracking-widest">
                    Login to SFA
                  </h4>
                  <SocialAuth />
                  <div className="relative my-6 text-center">
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-brand-gray-200"></span>
                    </span>
                    <span className="relative px-2 bg-brand-gray-50 text-brand-gray-400 text-[10px] uppercase">
                      Or Individual
                    </span>
                  </div>
                  <SocialButton
                    provider="google"
                    text="Continue with Google"
                    className="w-full"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-brand-gray-500">
                    Using{" "}
                    <code className="text-brand-teal-700">
                      variant=&quot;social&quot; size=&quot;social&quot;
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 02. Form Elements */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              01. Form Elements & Typography
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Inputs & Selection</CardTitle>
                <CardDescription>
                  Consistent typography and premium 48px height.
                </CardDescription>
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
                <CardDescription>
                  Brand Teal active states with 8px/full radii.
                </CardDescription>
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
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              02. Premium UI Elements
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avatars */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Avatar Scale</CardTitle>
                <CardDescription>
                  Brand sizes from XS (24px) to 2XL (64px).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-6">
                  {["xs", "sm", "md", "lg", "xl", "2xl"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <Avatar size={s}>
                        <AvatarFallback>{s.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-mono text-brand-gray-400">
                        {s}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-mono text-brand-gray-400">
                      image
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modals */}
            <Card>
              <CardHeader>
                <CardTitle>Dialogs & Modals</CardTitle>
                <CardDescription>
                  Refined for SFA with 16px radius.
                </CardDescription>
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
                        Update your researcher profile and affiliation details
                        here.
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
                    <h4 className="font-bold text-brand-gray-900">
                      Research & Dev
                    </h4>
                    <p className="text-xs text-brand-gray-500">1.2k Members</p>
                  </div>
                </div>
                <p className="text-sm text-brand-gray-600 line-clamp-2">
                  Exploring new frontiers in African science and technology
                  collaboration.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  Join Community
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b mb-4">
                <CardTitle>Event Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">Upcoming</Badge>
                  <span className="text-xs font-bold text-brand-orange-500 uppercase">
                    24 Mar 2026
                  </span>
                </div>
                <h4 className="font-bold text-brand-gray-900 text-lg">
                  Science Summit 2026
                </h4>
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
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              03. Metadata
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="space-y-4">
              <Label className="text-brand-gray-400 uppercase text-[10px] tracking-widest">
                Badges
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="error" size="lg">
                  Error LG
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
