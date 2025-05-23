import { LiaAws } from "react-icons/lia";
import {
  SiAnthropic,
  SiOpenai,
  SiConventionalcommits,
  SiMicrosoftazure,
} from "react-icons/si";

export default function ProviderIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  if (type === "openai") {
    return <SiOpenai className={className} />;
  }

  if (type === "anthropic") {
    return <SiAnthropic className={className} />;
  }

  if (type === "azure-openai") {
    return <SiMicrosoftazure className={className} />;
  }

  if (type === "bedrock") {
    return <LiaAws className={className} />;
  }

  return <SiConventionalcommits className={className} />;
}
