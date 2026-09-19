import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  );
}

export default AuthLayout;
