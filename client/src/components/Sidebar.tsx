import { useState } from "react";
import {
  useLogoutUserMutation,
  useValidateUserQuery,
} from "../features/userApi";
import { useNavigate } from "react-router-dom";
import { successToast } from "../helper";

const Sidebar = () => {
  const [showMenu, setShowMenu] = useState<Boolean>(false);
  const [logoutAdmin] = useLogoutUserMutation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useValidateUserQuery();

  return (
    <div className="w-1/4 bg-white border-r border-gray-300">
      <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
        <h1 className="text-2xl font-semibold">Chat Web</h1>
        <div className="relative">
          <button
            id="menuButton"
            className="focus:outline-none align-middle"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              className="h-10 w-10 rounded-full"
              src={data?.user?.profileImage}
              alt="logo"
            />
          </button>

          <div
            id="menuDropdown"
            className={`absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg ${
              !showMenu ? "hidden" : ""
            }`}
          >
            <ul className="py-2 px-3">
              <li>
                <a
                  onClick={async () => {
                    const { error } = await logoutAdmin();
                    if (!error) {
                      successToast("Logged out successfully.");
                      navigate("/login");
                    }
                  }}
                  className="block px-4 py-2 text-gray-800 hover:text-gray-400"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
        <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
          <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
            <img
              src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
              alt="User Avatar"
              className="w-12 h-12 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Alice</h2>
            <p className="text-gray-600">Hoorayy!!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
