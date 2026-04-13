import { useState } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

export default function StepInviteUsers() {
  const { formData, addInviteEmail, removeInviteEmail, nextStep, prevStep } =
    useCollaborationStore();

  const [emailInputs, setEmailInputs] = useState(() => {
    if (formData.inviteEmails.length > 0) {
      return formData.inviteEmails.map((e) => ({ value: e, error: "" }));
    }
    return [{ value: "", error: "" }];
  });

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

  const handleRemoveInput = (index) => {
    const email = emailInputs[index].value;
    if (email) removeInviteEmail(email);
    const updated = emailInputs.filter((_, i) => i !== index);
    if (updated.length === 0) updated.push({ value: "", error: "" });
    setEmailInputs(updated);
  };

  const handleNext = () => {
    // Sync valid emails to store
    const validEmails = emailInputs
      .map((e) => e.value.trim())
      .filter((e) => e && !validateEmail(e));

    // Clear and re-add
    formData.inviteEmails.forEach((e) => removeInviteEmail(e));
    validEmails.forEach((e) => addInviteEmail(e));

    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  const hasValidEmails = emailInputs.some(
    (e) => e.value.trim() && !validateEmail(e.value),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {emailInputs.map((input, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Input
                type="email"
                value={input.value}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="collaborator@example.com"
              />
              {input.error && (
                <p className="text-xs text-red-500">{input.error}</p>
              )}
            </div>
            {emailInputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(index)}
                className="mt-3 text-brand-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddAnother}
        className="self-start gap-1.5 text-brand-teal-600 hover:text-brand-teal-700"
      >
        <Plus className="size-4" />
        Add another
      </Button>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={prevStep} className="rounded-full">
          Back
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="rounded-full"
        >
          Skip
        </Button>
        <Button onClick={handleNext} className="rounded-full">
          Next
        </Button>
      </div>
    </div>
  );
}
