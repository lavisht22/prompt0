import { cn } from "@nextui-org/react";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <h1 className="text-2xl font-semibold font-mono text-primary text-left">
        prompt0
      </h1>
    </div>
  );
}
