import { useCollaborationStore } from "@/lib/collaboration-store";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import StepSelectTopics from "./StepSelectTopics";
import StepCreateSpace from "./StepCreateSpace";
import StepSelectDueDate from "./StepSelectDueDate";
import StepAssignMentor from "./StepAssignMentor";
import StepInviteUsers from "./StepInviteUsers";
import StepSuccess from "./StepSuccess";

const STEPS = {
  1: { component: StepSelectTopics, title: "What topic will your collaboration be dedicated to?", subtitle: "Choose a topic to help find your community." },
  2: { component: StepCreateSpace, title: "Create Collaboration Space" },
  3: { component: StepSelectDueDate, title: "Select a due date", subtitle: "The following date will terminate the collaboration space." },
  4: { component: StepAssignMentor, title: "Assign a mentor", subtitle: "The following users have access to this project:" },
  5: { component: StepInviteUsers, title: "Invite users and collaborators", subtitle: "Your new collaboration has been created. Invite colleagues to collaborate on this project." },
  6: { component: StepSuccess, title: null },
};

export default function CreateCollaborationDialog() {
  const { isOpen, step, close } = useCollaborationStore();

  const currentStep = STEPS[step];
  const CurrentStep = currentStep?.component;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        size={step === 3 ? "xl" : "lg"}
        showCloseButton={false}
        className="max-h-[90vh] overflow-visible"
      >
        {currentStep?.title && (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">
                {currentStep.title}
              </h2>
              {currentStep.subtitle && (
                <p className="text-sm text-brand-gray-500">
                  {currentStep.subtitle}
                </p>
              )}
            </div>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 -mt-1 -mr-1"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        )}

        {CurrentStep && <CurrentStep />}
      </DialogContent>
    </Dialog>
  );
}
