"use client";

import Image from "next/image";
import CapsuleButton from "../capsule/CapsuleButton";
import { Logo } from "@/utils/fallbackIcon";

const Navbar = () => {
  return (
    <div className="flex p-3 h-32 w-full justify-between items-center">
      <div>
        <Image src={Logo} width={240} height={30} alt="everydae" />
      </div>
      <div>
        <CapsuleButton />
      </div>
    </div>
  );
};

export default Navbar;
