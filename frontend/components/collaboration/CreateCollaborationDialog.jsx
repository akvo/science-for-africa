import { useCollaborationStore } from "@/lib/collaboration-store";
import { useTranslation } from "next-i18next";
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
import StepVisibility from "./StepVisibility";
import StepInviteUsers from "./StepInviteUsers";
import StepSuccess from "./StepSuccess";

const STEPS = {
  1: { component: StepSelectTopics, titleKey: "collaboration_dialog.step1_title", subtitleKey: "collaboration_dialog.step1_subtitle" },
  2: { component: StepCreateSpace, titleKey: "collaboration_dialog.step2_title", subtitleKey: "collaboration_dialog.step2_subtitle" },
  3: { component: StepSelectDueDate, titleKey: "collaboration_dialog.step3_title", subtitleKey: "collaboration_dialog.step3_subtitle" },
  4: { component: StepAssignMentor, titleKey: "collaboration_dialog.step4_title", subtitleKey: "collaboration_dialog.step4_subtitle" },
  5: { component: StepVisibility, titleKey: "collaboration_dialog.step5_title", subtitleKey: null },
  6: { component: StepInviteUsers, titleKey: "collaboration_dialog.step6_title", subtitleKey: "collaboration_dialog.step6_subtitle" },
  7: { component: StepSuccess, titleKey: null },
};

export default function CreateCollaborationDialog() {
  const { t } = useTranslation("community");
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
        className="max-h-[90vh] overflow-y-auto"
      >
        {currentStep?.titleKey && (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">
                {t(currentStep.titleKey)}
              </h2>
              {currentStep.subtitleKey && (
                <p className="text-sm text-brand-gray-500">
                  {t(currentStep.subtitleKey)}
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
              <span className="sr-only">{t("collaboration_dialog.close")}</span>
            </DialogClose>
          </div>
        )}

        {CurrentStep && <CurrentStep />}
      </DialogContent>
    </Dialog>
  );
}
