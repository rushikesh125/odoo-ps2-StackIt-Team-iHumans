"use client";
import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { ArrowRight, AudioWaveform, AudioWaveformIcon, Bell, BrainCircuit, BrainCircuitIcon, Clapperboard, GitBranchPlus, GraduationCap, TvMinimalPlay } from "lucide-react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/config"
import { removeUser, setUser } from "../../store/userSlice"
import toast from "react-hot-toast";
import UserDropdown from "./UserDropdown";
const MainNavbar = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const tempUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        dispatch(setUser(tempUser));
      } else {
        dispatch(removeUser());
      }
    });
    return () => unsub();
  }, []);

  
  const handleSigninWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Login Success");
    } catch (error) {
      toast.error(error?.message);
      console.log("ERROR:::::", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 bg-white z-30 w-full border-b border-slate-700/[0.1] ">
      <Navbar >
        <NavbarContent>
         
          <NavbarBrand>
            <Link href="/" className="text-[var(--themecolor)] flex justify-center items-center gap-2">
            <GraduationCap size={24}  />
            <p className="font-bold text-inherit">StackIt</p>
            </Link>
          </NavbarBrand>

          <NavbarItem className="mx-2 md:mx-4">
            {/* <Link
              color="foreground"
              className="flex items-center justify-center gap-2 hover:text-purple-500"
              href="/enrolled-courses"
            > */}
             <Bell size={25}/>
              {/* Enrolled Courses */}
            {/* </Link> */}
          </NavbarItem>
        </NavbarContent>

       
        <NavbarItem className="">
          {user ? (
            <UserDropdown user={user}/>
          ) : (
            <Button
              isLoading={isLoading}
              onPress={handleSigninWithGoogle}
              className="flex bg-transparent cursor-pointer justify-center group text-purple-500 hover:bg-purple-500 hover:text-white items-center py-2 px-4 rounded-lg border border-purple-500"
            >
              Login
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          )}
        </NavbarItem>
        
      </Navbar>
    </header>
  );
};

export default MainNavbar;