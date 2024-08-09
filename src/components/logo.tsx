import { cn } from "@nextui-org/react";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-end", className)}>
      <h1 className="text-2xl md:text-3xl font-bold font-sans mr-2 text-primary">
        PromptLab
      </h1>
    </div>
  );
}
