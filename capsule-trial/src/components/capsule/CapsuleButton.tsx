"use client";
import { capsuleClient } from "@/client/capsule";
import { CapsuleModal, OAuthMethod } from "@usecapsule/react-sdk";
import "@usecapsule/react-sdk/styles.css";
import { useState } from "react";

export default function CapsuleButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Open Capsule Modal
      </button>
      <CapsuleModal
        capsule={capsuleClient}
        appName="Capsule Modal Starter Template"
        logo={""}
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
