"use client";
import { capsuleClient } from "@/client/capsule";
import { CapsuleLogo, LogoIcon } from "@/utils/fallbackIcon";
import { CapsuleModal, OAuthMethod } from "@usecapsule/react-sdk";
import "@usecapsule/react-sdk/styles.css";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function CapsuleButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isConnected } = useAccount();

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        {isConnected ? (
          <img src={CapsuleLogo} width={60} height={60} className="mr-10" />
        ) : (
          "CONNECT BUTTON"
        )}
      </button>
      <CapsuleModal
        capsule={capsuleClient}
        appName="Everydae"
        logo={LogoIcon}
        disableEmailLogin={false}
        disablePhoneLogin={false}
        oAuthMethods={Object.values(OAuthMethod)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRampTestMode={true}
        twoFactorAuthEnabled={false}
        externalWallets={["METAMASK", "WALLETCONNECT"]}
      />
    </div>
  );
}
