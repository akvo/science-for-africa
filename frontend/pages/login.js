import React from "react";

const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-display-sm font-bold text-brand-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-brand-gray-500">
          Enter your details to access your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@institution.org"
            className="w-full px-4 py-3 rounded-8 border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-brand-gray-700">
              Password
            </label>
            <a
              href="#"
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-8 border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
          />
        </div>
        <button className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-8 transition-colors shadow-sm">
          Sign In
        </button>
      </div>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-brand-gray-400 font-bold tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <button className="w-full py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-brand-gray-700 font-bold rounded-8 transition-colors flex items-center justify-center gap-3">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg"
          alt="Google"
          className="h-5 w-5"
        />
        Sign in with Google
      </button>

      <p className="text-center text-sm text-brand-gray-500">
        Don't have an account?{" "}
        <a href="#" className="text-primary-600 font-bold hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
