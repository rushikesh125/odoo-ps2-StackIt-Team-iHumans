"use client";
import React from "react";
import MainNavbar from "../components/MainNavbar";
import { useSelector } from "react-redux";
import Link from "next/link";
import Loading from "../loading";

const UserLayout = ({ children }) => {
  const user = useSelector((state) => state.user);

  // if(user == undefined){
  //   return <Loading/>
  // }
  return (
    <>
      {/* <MainNavbar/> */}
      {user ==null ? (
        <div className="w-full text-center my-10 text-red-400 font-semibold text-3xl">
          You Are Not Logged in , Please Login !
        </div>
      ) : (
        <div className="bg-gray-100 min-h-screen py-4 w-full">{children}</div>
      )}
    </>
  );
};

export default UserLayout;
