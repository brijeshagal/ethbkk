"use client";

import CapsuleButton from "../capsule/CapsuleButton";

const Navbar = () => {
  return (
    <div className="flex p-3 h-32 w-full justify-between items-center">
      <div>The Only Dex you need</div>
      <div>
        <CapsuleButton />
      </div>
    </div>
  );
};

export default Navbar;
