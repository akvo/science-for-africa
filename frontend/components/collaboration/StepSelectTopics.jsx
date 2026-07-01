import { useCollaborationStore } from "@/lib/collaboration-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOPICS = [
  "STI policy and governance",
  "Institutional research and innovation strategy",
  "Research and innovation funding systems",
  "Open science and data governance",
  "Responsible Research and Innovation (RRI)",
  "Pre-award support and research development",
  "Post-award grants management",
  "International partnerships and equitable collaboration",
  "Industry-academia collaboration",
  "Contract and legal frameworks",
  "Intellectual property and knowledge assets",
  "Technology transfer and commercialisation",
  "Start-ups, spin-outs, and entrepreneurship",
  "Research translation and uptake",
  "Socio-economic and policy impact",
  "Research management systems (RMIS)",
  "Innovation management systems",
  "Research integrity and ethics",
  "Capacity strengthening and training",
  "Leadership and professional development",
  "Research and innovation governance frameworks",
  "Institutional policies and oversight",
  "Research and innovation strategy development and priority-setting",
  "Leadership of research or innovation offices",
  "Institutional readiness, risk management, and due-diligence",
  "Pre-award research and innovation development",
  "Grant and contract negotiation",
  "Partnership development (academic, industry, public)",
  "Fundraising and funding diversification",
  "Post-award financial management",
  "Financial reporting and audits",
  "Risk management and internal controls",
  "Research management information systems",
  "Innovation / technology transfer systems",
  "Data and records management",
  "Shared research or innovation infrastructure",
  "Training of research and innovators managers",
  "Training of researchers and innovators",
  "Mentorship and coaching",
  "Professionalisation of research and innovation management roles",
  "Ethics review and oversight",
  "Regulatory compliance",
  "Research integrity and misconduct management",
  "Monitoring, evaluation, and learning for research and innovation",
  "Performance indicators and reporting",
  "Institutional learning and quality improvement",
  "Intellectual property and knowledge assets management",
  "Technology transfer and Commercialisation",
  "Industry and innovation ecosystem engagement",
  "Research translation, uptake, and societal impact",
  "Entrepreneurship, start-ups, spin-outs, or innovation hubs",
  "Public value, socio-economic impact, and sustainability of innovation",
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
