import { Avatar } from "@nextui-org/react";
import Logo from "../../../../components/logo";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-full flex flex-col items-start justify-between p-4">
      <div>
        <div className="">
          <Logo />
        </div>

        <div className="mt-20">Workspace Select</div>

        <div className="flex flex-col mt-10 space-y-4">
          <Link to="prompts">Prompts</Link>
          <Link to="providers">Providers</Link>
        </div>
      </div>

      <Avatar />
    </div>
  );
}
