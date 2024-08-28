import Logo from "components/logo";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-screen grid grid-cols-12">
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col justify-center items-center px-8 border-r shadow-xl relative">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        <Outlet />
      </div>
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-8 bg-content2"></div>
    </div>
  );
}
