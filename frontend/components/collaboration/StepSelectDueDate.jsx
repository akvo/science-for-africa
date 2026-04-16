import { useState } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import {
  format,
  addWeeks,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

const PRESETS = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: "This week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "This year",
    getValue: () => ({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(new Date().getFullYear(), 11, 31),
    }),
  },
  {
    label: "All time",
    getValue: () => ({
      from: new Date(),
      to: addYears(new Date(), 1),
    }),
  },
];

export default function StepSelectDueDate() {
  const { formData, updateFormData, nextStep, prevStep } =
    useCollaborationStore();

  const [range, setRange] = useState(() => {
    if (formData.startDate && formData.endDate) {
      return {
        from: new Date(formData.startDate),
        to: new Date(formData.endDate),
      };
    }
    return undefined;
  });

  const [activePreset, setActivePreset] = useState(null);
  const [error, setError] = useState("");

  const handleSelect = (selectedRange) => {
    setRange(selectedRange);
    setActivePreset(null);
    setError("");
    if (selectedRange?.from) {
      updateFormData({ startDate: selectedRange.from.toISOString() });
    }
    if (selectedRange?.to) {
      updateFormData({ endDate: selectedRange.to.toISOString() });
    }
  };

  const handlePreset = (preset, index) => {
    const { from, to } = preset.getValue();
    setRange({ from, to });
    setActivePreset(index);
    setError("");
    updateFormData({
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    });
  };

  const handleNext = () => {
    if (!range?.from || !range?.to) {
      setError("Please select a start and end date");
      return;
    }
    nextStep();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6">
        {/* Presets sidebar */}
        <div className="hidden sm:flex flex-col gap-1 min-w-[120px] border-r border-brand-gray-100 pr-6 pt-2">
          {PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset, i)}
              className={cn(
                "rounded-8 px-3 py-2 text-left text-sm font-medium transition-colors",
                activePreset === i
                  ? "bg-brand-teal-50 text-brand-teal-700"
                  : "text-brand-gray-600 hover:bg-brand-gray-50",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Calendars */}
        <div className="flex-1 overflow-x-auto">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            navLayout="around"
            weekStartsOn={1}
            disabled={{ before: new Date() }}
            styles={{
              root: {
                "--rdp-accent-color": "#005850",
                "--rdp-accent-background-color": "#e6eeee",
                "--rdp-range_start-date-background-color": "#005850",
                "--rdp-range_end-date-background-color": "#005850",
                "--rdp-range_middle-background-color": "#e6eeee",
                "--rdp-range_start-color": "#fff",
                "--rdp-range_end-color": "#fff",
                "--rdp-today-color": "#005850",
                "--rdp-day-width": "40px",
                "--rdp-day-height": "40px",
                "--rdp-day_button-width": "36px",
                "--rdp-day_button-height": "36px",
              },
              months: { flexWrap: "nowrap" },
            }}
          />
        </div>
      </div>

      {/* Bottom row: date display + buttons */}
      <div className="flex items-center justify-between border-t border-brand-gray-100 pt-4">
        <div className="flex items-center gap-2">
          {range?.from ? (
            <>
              <span className="inline-flex h-10 items-center rounded-8 border border-brand-gray-200 bg-white px-3 text-sm text-brand-gray-700">
                {format(range.from, "MMM d, yyyy")}
              </span>
              <span className="text-brand-gray-400">–</span>
              <span className="inline-flex h-10 items-center rounded-8 border border-brand-gray-200 bg-white px-3 text-sm text-brand-gray-700">
                {range.to
                  ? format(range.to, "MMM d, yyyy")
                  : "Select end date"}
              </span>
            </>
          ) : (
            <span className="text-sm text-brand-gray-400">
              No dates selected
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            className="rounded-full"
          >
            Back
          </Button>
          <Button onClick={handleNext} className="rounded-full">
            Next
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
