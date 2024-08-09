import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-screen grid grid-cols-12">
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col justify-center items-center px-8 border-r shadow-xl">
        <Outlet />
      </div>
      <div className="hidden sm:flex lg:col-span-6 xl:col-span-8 bg-content2"></div>
    </div>
  );
}
