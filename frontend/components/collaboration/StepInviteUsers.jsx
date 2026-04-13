import { useState } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Info, Loader2 } from "lucide-react";
import { createCollaborationCall } from "@/lib/strapi";

export default function StepInviteUsers() {
  const { formData, addInviteEmail, removeInviteEmail, nextStep } =
    useCollaborationStore();

  const [emailInputs, setEmailInputs] = useState(() => {
    if (formData.inviteEmails.length > 0) {
      return formData.inviteEmails.map((e) => ({ value: e, error: "" }));
    }
    return [{ value: "", error: "" }, { value: "", error: "" }];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    if (!email) return "";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? "" : "Invalid email address";
  };

  const handleEmailChange = (index, value) => {
    const updated = [...emailInputs];
    updated[index] = { value, error: validateEmail(value) };
    setEmailInputs(updated);
  };

  const handleAddAnother = () => {
    setEmailInputs([...emailInputs, { value: "", error: "" }]);
  };

  const syncEmails = () => {
    const validEmails = emailInputs
      .map((e) => e.value.trim())
      .filter((e) => e && !validateEmail(e));

    formData.inviteEmails.forEach((e) => removeInviteEmail(e));
    validEmails.forEach((e) => addInviteEmail(e));
    return validEmails;
  };

  const handleSendInvites = async () => {
    const validEmails = syncEmails();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createCollaborationCall({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        topics: formData.topics,
        communityName: formData.communityName,
        inviteEmails: validEmails,
        mentorEmails: formData.mentorEmails,
      });

      if (result && !result.error) {
        nextStep();
      } else {
        setError(result?.error || "Failed to create collaboration call");
      }
    } catch (err) {
      setError(err.error || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createCollaborationCall({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        topics: formData.topics,
        communityName: formData.communityName,
        inviteEmails: [],
        mentorEmails: formData.mentorEmails,
      });

      if (result && !result.error) {
        nextStep();
      } else {
        setError(result?.error || "Failed to create collaboration call");
      }
    } catch (err) {
      setError(err.error || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-0">
      <div className="w-full space-y-4">
        <Label className="text-sm font-semibold text-brand-gray-900">
          Email
        </Label>
        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {emailInputs.map((input, index) => (
            <div key={index} className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-gray-400" />
                <Input
                  type="email"
                  value={input.value}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="olivia@untitledui.com"
                  className="pl-10 pr-10"
                />
                <Info className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-gray-400" />
              </div>
              {input.error && (
                <p className="text-xs text-red-500">{input.error}</p>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddAnother}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-gray-700 hover:text-brand-gray-900 transition-colors"
        >
          <Plus className="size-4" />
          Add another
        </button>
      </div>

      {error && <p className="text-sm text-red-500 w-full">{error}</p>}

      <div className="flex w-full gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="flex-1 rounded-full"
        >
          Skip
        </Button>
        <Button
          onClick={handleSendInvites}
          disabled={isSubmitting}
          className="flex-1 rounded-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send invites"
          )}
        </Button>
      </div>
    </div>
  );
}
