import { auth} from "../../firebase/config"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User,
} from "@heroui/react";
import { signOut } from "firebase/auth";
import { Bell, Clapperboard, GitBranch, LogOut, Route, ScanSearch, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserDropdown({ user }) {
  const handleSignLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast.error(error?.error);
    }
  };
  return (
    <div className="flex items-center gap-4 ">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
          showFallback
            isBordered
            color="secondary"
            as="button"
            className="transition-transform"
            src={user?.photoURL}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat" className="border rounded-lg border-slate-700/[0.1] shadow-md ">
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-semibold">{user && user?.displayName}</p>
            <p className="text-sm">{user && user?.email}</p>
          </DropdownItem>

         
          <DropdownItem key="logout" color="danger" className="hover:text-red-700 hover:bg-red-100 rounded-md" onPress={handleSignLogOut}>
            <div className="flex  items-center gap-2 ">
              <LogOut size={15} />
              Log Out
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
