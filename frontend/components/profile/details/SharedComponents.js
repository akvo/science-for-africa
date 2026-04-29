import React from "react";
import { Label } from "@/components/ui/label";

export const FormRow = ({ label, description, children, error }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4 border-b border-brand-gray-100 last:border-0 items-start">
    <div className="md:col-span-4 transition-all pr-4">
      <Label className="text-[15px] font-bold text-brand-gray-900 mb-1 block">
        {label}
      </Label>
      {description && (
        <p className="text-xs text-brand-gray-500 leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
    <div className="md:col-span-8 flex flex-col gap-3">
      {children}
      {error && (
        <p className="text-[11px] text-red-600 font-bold mt-1">
          {error.message}
        </p>
      )}
    </div>
  </div>
);

export const ViewRow = ({ label, value, badge, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 pb-9 border-b border-brand-gray-100 last:border-0 items-baseline">
    <div className="md:col-span-4">
      <span className="text-[15px] font-bold text-brand-gray-900">{label}</span>
    </div>
    <div className="md:col-span-8 flex items-baseline gap-3">
      <span className="text-[15px] text-brand-gray-500 font-medium">
        {value || (
          <span className="italic text-brand-gray-300">
            {t ? t("details.not_provided") : "Not provided"}
          </span>
        )}
      </span>
      {badge}
    </div>
  </div>
);
