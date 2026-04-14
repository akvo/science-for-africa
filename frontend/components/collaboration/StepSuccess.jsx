import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/router";

export default function StepSuccess() {
  const { formData, close } = useCollaborationStore();
  const router = useRouter();

  const handleManage = () => {
    close();
  };

  const handleAccessPage = () => {
    close();
    router.push("/community");
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="size-8 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-brand-gray-900">
          Collaboration Created!
        </h2>
        <p className="text-sm text-brand-gray-500 max-w-sm">
          Your collaboration call &ldquo;{formData.title}&rdquo; has been
          created successfully. Invitation emails have been sent to your
          collaborators.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleManage} className="rounded-full">
          Manage
        </Button>
        <Button onClick={handleAccessPage} className="rounded-full">
          Access page
        </Button>
      </div>
    </div>
  );
}
