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
      ...(await serverSideTranslations(locale, [
        "common",
        "profile",
        "community",
      ])),
    },
  };
}

export default function StyleGuide() {
  const { t } = useTranslation(["common", "profile", "community"]);

  return (
    <div className="min-h-screen bg-white">
      <Meta title={t("seo.home_title")} />

      <nav className="border-b border-brand-gray-100 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-brand-teal-900">
            <span className="text-2xl">SFA</span>
            <span className="text-brand-gray-400">/</span>
            <span>{t("navbar.about", { defaultValue: "Design System" })}</span>
          </div>
          <Badge variant="primary" size="sm">
            {t("style_guide.components")}
          </Badge>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 space-y-24">
        {/* Hero Section */}
        <header className="max-w-3xl space-y-4">
          <h1 className="text-display-lg text-brand-teal-900 uppercase">
            {t("common.brand_expansion", { defaultValue: "Brand Expansion" })}
          </h1>
          <p className="text-xl text-brand-gray-600">
            {t("common.style_guide_desc", {
              defaultValue:
                "Official Button System, Avatars, Cards, and Modals.",
            })}
          </p>
        </header>

        {/* 01. Button System */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              00. {t("style_guide.official_button_system")}
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Standard Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>{t("style_guide.standard_sizes")}</CardTitle>
                <CardDescription>
                  {t("style_guide.standard_sizes_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-wrap items-end gap-4">
                  {["sm", "md", "lg", "xl", "2xl"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <Button size={s}>
                        {t("common.button")} {s.toUpperCase()}
                      </Button>
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
                <CardTitle>{t("style_guide.social_auth")}</CardTitle>
                <CardDescription>
                  {t("style_guide.social_auth_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-sm mx-auto p-6 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                  <h4 className="text-sm font-bold text-brand-gray-700 mb-6 text-center uppercase tracking-widest">
                    {t("style_guide.login_to_sfa")}
                  </h4>
                  <SocialAuth />
                  <div className="relative my-6 text-center">
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-brand-gray-200"></span>
                    </span>
                    <span className="relative px-2 bg-brand-gray-50 text-brand-gray-400 text-[10px] uppercase">
                      {t("style_guide.or_individual")}
                    </span>
                  </div>
                  <SocialButton
                    provider="google"
                    text={t("style_guide.continue_with_google")}
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
              01. {t("style_guide.form_elements")}
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("style_guide.inputs_selection")}</CardTitle>
                <CardDescription>
                  {t("style_guide.inputs_selection_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label>{t("style_guide.email_address")}</Label>
                  <Input placeholder="olivia@untitledui.com" />
                </div>
                <div className="space-y-2">
                  <Label>{t("style_guide.country_selector")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("style_guide.select_country")}
                      />
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
                <CardTitle>{t("style_guide.selection_controls")}</CardTitle>
                <CardDescription>
                  {t("style_guide.selection_controls_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-lg">
                  <Label className="text-base">
                    {t("style_guide.push_notifications")}
                  </Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">
                    {t("style_guide.agree_to_terms")}
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 02. Premium UI Elements */}
        <section className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              02. {t("style_guide.premium_ui")}
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avatars */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t("style_guide.avatar_scale")}</CardTitle>
                <CardDescription>
                  {t("style_guide.avatar_scale_desc")}
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
                <CardTitle>{t("style_guide.dialogs_modals")}</CardTitle>
                <CardDescription>
                  {t("style_guide.dialogs_modals_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      {t("style_guide.open_modal")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("style_guide.profile_info")}</DialogTitle>
                      <DialogDescription>
                        {t("style_guide.profile_info_desc")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>{t("style_guide.full_name")}</Label>
                        <Input defaultValue="Dr. Olivia Rhye" />
                      </div>
                    </div>
                    <DialogFooter showCloseButton>
                      <Button variant="primary">
                        {t("common.save_changes")}
                      </Button>
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
                <CardTitle>{t("style_guide.community_card")}</CardTitle>
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
                    <p className="text-xs text-brand-gray-500">
                      {t("style_guide.members_count", { count: "1.2k" })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-brand-gray-600 line-clamp-2">
                  {t("style_guide.community_desc")}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  {t("style_guide.join_community")}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b mb-4">
                <CardTitle>{t("style_guide.event_card")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{t("style_guide.upcoming")}</Badge>
                  <span className="text-xs font-bold text-brand-orange-500 uppercase">
                    24 Mar 2026
                  </span>
                </div>
                <h4 className="font-bold text-brand-gray-900 text-lg">
                  {t("style_guide.event_title")}
                </h4>
                <p className="text-sm text-brand-gray-600">
                  {t("style_guide.event_desc")}
                </p>
              </CardContent>
              <CardFooter className="bg-brand-gray-50">
                <Button className="w-full">
                  {t("style_guide.register_now")}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 03. Metadata & Navigation */}
        <section className="space-y-12 pb-24">
          <div className="space-y-2">
            <h2 className="text-display-xs text-brand-teal-900 uppercase tracking-wider">
              03. {t("style_guide.metadata")}
            </h2>
            <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="space-y-4">
              <Label className="text-brand-gray-400 uppercase text-[10px] tracking-widest">
                {t("style_guide.badges")}
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="primary">{t("style_guide.primary")}</Badge>
                <Badge variant="secondary">{t("style_guide.secondary")}</Badge>
                <Badge variant="success">{t("style_guide.success")}</Badge>
                <Badge variant="error" size="lg">
                  {t("style_guide.error_lg")}
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "profile"])),
    },
  };
}
