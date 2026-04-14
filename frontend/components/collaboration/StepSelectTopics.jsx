import { useCollaborationStore } from "@/lib/collaboration-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOPIC_CATEGORIES = {
  "Research Areas": [
    "Bioinformatics",
    "Genetics",
    "Virology",
    "Immunology",
    "Ecology",
    "Epidemiology",
    "Public Health",
    "Climate Change",
  ],
  "Arts & Culture": [
    "Art",
    "Music",
    "Literature",
    "Film",
    "Photography",
    "Dance",
  ],
  Lifestyle: ["Travel", "Cooking", "Fitness", "Gardening", "Fashion"],
  Technology: [
    "AI & Machine Learning",
    "Data Science",
    "Software Development",
    "Robotics",
  ],
  Education: [
    "Curriculum Design",
    "STEM Outreach",
    "Teacher Training",
    "Mentorship",
  ],
};

export default function StepSelectTopics() {
  const { formData, toggleTopic, nextStep } = useCollaborationStore();
  const selectedTopics = formData.topics;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 space-y-5 scrollbar-thin scrollbar-thumb-brand-gray-200 scrollbar-track-transparent">
        {Object.entries(TOPIC_CATEGORIES).map(([category, topics]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-brand-gray-700">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const selected = selectedTopics.includes(topic);
                return (
                  <Badge
                    key={topic}
                    role="button"
                    variant={selected ? "default" : "outline"}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "px-3.5 py-4 text-sm font-normal rounded-full transition-all duration-300 cursor-pointer shadow-none",
                      selected
                        ? "bg-brand-teal-600 text-white border-brand-teal-600 hover:bg-brand-teal-700 active:scale-95"
                        : "bg-white text-brand-gray-700 border-brand-gray-200 hover:bg-brand-teal-50 hover:border-brand-teal-200 active:scale-95",
                    )}
                  >
                    {topic}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
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
