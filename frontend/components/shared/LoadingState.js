import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-brand-gray-400">
      <Loader2 className="size-8 animate-spin" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
