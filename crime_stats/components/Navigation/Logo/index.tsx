import { GoLaw } from "react-icons/go";

const Logo = () => (
  <div className="flex items-center justify-start">
    {/* Logo */}
    <div className="items-center gap-3 text-2xl lg:flex text-white ml-0 md:ml-4">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
        <GoLaw color="white" size="32" />
      </div>
      <span className="text-xl xl:text-3xl font-bold bg-gradient-to-r hidden lg:flex from-white to-slate-300 bg-clip-text text-transparent">
        Crime Map
      </span>
    </div>
  </div>
);

export default Logo;
