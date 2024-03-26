"use client";

import { ModeToggle } from "@/components/global/ModeToggle";
import { UserButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  user?: User;
};

const Navigation = ({ user }: Props) => {
  return (
    <>
      <div className="p-4 fixed top-0 left-0 right-0 z-20 flex items-center justify-between before:block before:w-full before:h-full before:absolute before:top-0 before:left-0 before:opacity-10 before:z-[-200] backdrop-blur-md">
        <aside className="flex items-center gap-2">
          <Image
            src={"./assets/plura-logo.svg"}
            width={40}
            height={40}
            alt="sassy-logo"
          />

          <span className="text-xl font-bold">Comfort</span>
        </aside>

        <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          <ul className="flex items-center justify-center gap-8">
            <Link href={"#"}>Pricing</Link>
            <Link href={"#"}>About</Link>
            <Link href={"#"}>Documentation</Link>
            <Link href={"#"}>Features</Link>
          </ul>
        </nav>

        <aside className="flex gap-2 items-center">
          <Link
            href={"/agency"}
            className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
          >
            Login
          </Link>
          <UserButton />
          <ModeToggle />
        </aside>
      </div>
    </>
  );
};

export default Navigation;
