import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Meta from "@/components/seo/Meta";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Meta title="Collaboration Invitation" />
      <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-teal-50">
          <CheckCircle className="size-8 text-brand-teal-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-brand-gray-900">
            Collaboration Invitation
          </h1>
          <p className="text-sm text-brand-gray-500">
            This feature is coming soon. You will be able to accept or decline
            collaboration invitations here.
          </p>
        </div>
        <Button onClick={() => router.push("/")} className="rounded-full">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
