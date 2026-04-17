import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Meta from "@/components/seo/Meta";
import { acceptCollaborationInvite } from "@/lib/strapi";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const result = await acceptCollaborationInvite(id);
      if (cancelled) return;
      if (result?.data) {
        setInvite(result.data);
        setStatus("accepted");
      } else {
        setErrorMessage(
          result?.error || "We couldn't accept this invitation.",
        );
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const callTitle = invite?.collaborationCall?.title;
  const callDocumentId = invite?.collaborationCall?.documentId;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Meta title="Collaboration Invitation" />
      <div className="flex max-w-md flex-col items-center gap-6 px-4 text-center">
        {status === "loading" ? (
          <>
            <Loader2 className="size-10 animate-spin text-brand-teal-600" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-brand-gray-900">
                Accepting invitation...
              </h1>
              <p className="text-sm text-brand-gray-500">
                Hang tight, we're confirming your invite.
              </p>
            </div>
          </>
        ) : null}

        {status === "accepted" ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-teal-50">
              <CheckCircle className="size-8 text-brand-teal-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-brand-gray-900">
                Invitation accepted
              </h1>
              <p className="text-sm text-brand-gray-500">
                {callTitle
                  ? `You've joined "${callTitle}".`
                  : "You've joined the collaboration."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {callDocumentId ? (
                <Button
                  onClick={() =>
                    router.push(`/community/calls/${callDocumentId}`)
                  }
                  className="rounded-full"
                >
                  Open collaboration
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="rounded-full"
              >
                Go to Home
              </Button>
            </div>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="size-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-brand-gray-900">
                Something went wrong
              </h1>
              <p className="text-sm text-brand-gray-500">{errorMessage}</p>
            </div>
            <Button onClick={() => router.push("/")} className="rounded-full">
              Go to Home
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
