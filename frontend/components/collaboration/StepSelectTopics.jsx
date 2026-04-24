import { useCollaborationStore } from "@/lib/collaboration-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Bioinformatics",
  "Genetics",
  "Virology",
  "Immunology",
  "Ecology",
  "Epidemiology",
  "Public Health",
  "Climate Change",
  "Art",
  "Music",
  "Literature",
  "Film",
  "Photography",
  "Dance",
  "Travel",
  "Cooking",
  "Fitness",
  "Gardening",
  "Fashion",
  "AI & Machine Learning",
  "Data Science",
  "Software Development",
  "Robotics",
  "Curriculum Design",
  "STEM Outreach",
  "Teacher Training",
  "Mentorship",
];

export default function StepSelectTopics() {
  const { formData, toggleTopic, nextStep } = useCollaborationStore();
  const selectedTopics = formData.topics;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-brand-gray-200 scrollbar-track-transparent">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const selected = selectedTopics.includes(topic);
            return (
              <Badge
                key={topic}
                role="button"
                variant="outline"
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "px-3.5 py-4 text-sm font-normal rounded-full transition-all duration-300 cursor-pointer",
                  selected
                    ? "bg-primary-50 text-brand-gray-700 border-[#D0D5DD] shadow-[0_1px_2px_0_rgba(16,24,40,0.05),0_0_0_4px_var(--color-primary-50)] active:scale-95"
                    : "bg-white text-brand-gray-700 border-brand-gray-200 shadow-none hover:bg-brand-teal-50 hover:border-brand-teal-200 active:scale-95",
                )}
              >
                {topic}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={nextStep}
          disabled={selectedTopics.length === 0}
          className="rounded-full"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
