import { useState } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, X, Loader2 } from "lucide-react";
import { createCollaborationCall } from "@/lib/strapi";

export default function StepInviteUsers() {
  const { formData, addInviteEmail, removeInviteEmail, updateFormData, nextStep, prevStep } =
    useCollaborationStore();

  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    if (!email) return "";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? "" : "Invalid email address";
  };

  const handleAddEmail = () => {
    const trimmed = currentEmail.trim();
    if (!trimmed) return;
    const err = validateEmail(trimmed);
    if (err) {
      setEmailError(err);
      return;
    }
    if (formData.inviteEmails.includes(trimmed)) {
      setEmailError("Email already added");
      return;
    }
    addInviteEmail(trimmed);
    setCurrentEmail("");
    setEmailError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvites = async () => {
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
        visibility: formData.visibility || "public",
        inviteEmails: formData.inviteEmails,
        mentorEmails: formData.mentorEmails,
      });

      if (result && !result.error) {
        updateFormData({ createdCallDocumentId: result.data?.documentId || result.documentId });
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
        visibility: formData.visibility || "public",
        inviteEmails: [],
        mentorEmails: formData.mentorEmails,
      });

      if (result && !result.error) {
        updateFormData({ createdCallDocumentId: result.data?.documentId || result.documentId });
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
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-brand-gray-900">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-gray-400" />
          <Input
            type="email"
            value={currentEmail}
            onChange={(e) => {
              setCurrentEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="name@email.com"
            className="pl-10 pr-20"
          />
          <button
            type="button"
            onClick={handleAddEmail}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-semibold text-brand-teal-700 hover:text-brand-teal-900 transition-colors px-2 py-1"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
        {emailError && (
          <p className="text-xs text-red-500">{emailError}</p>
        )}
      </div>

      {formData.inviteEmails.length > 0 && (
        <div className="space-y-0 max-h-[220px] overflow-y-auto">
          {formData.inviteEmails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-3 py-3 border-b border-brand-gray-100 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal-50 text-brand-teal-700">
                <Mail className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-brand-gray-900 truncate block">
                  {email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeInviteEmail(email)}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={prevStep}
          className="rounded-full"
        >
          Back
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="rounded-full"
        >
          Skip
        </Button>
        <Button
          onClick={handleSendInvites}
          disabled={isSubmitting}
          className="rounded-full"
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
