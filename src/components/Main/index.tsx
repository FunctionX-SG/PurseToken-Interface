import React, { useState } from "react";
import FarmDashboard from "./FarmDashboard";
import TokenDashboard from "./TokenDashboard";
import VaultDashboard from "./VaultDashboard";

export default function Main() {
  const [selectedTab, setSelectedTab] = useState("main");

  const renderTabs = () => {
    return (
      <div
        style={{
          backgroundColor: "#efefef",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "row",
          margin: "15px auto",
          padding: "2px",
          width: "240px",
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: selectedTab === "main" ? "#d461ff" : "",
            borderWidth: 0,
            borderRadius: "12px",
            color: selectedTab === "main" ? "#fff" : "#000",
            padding: "5px 3px",
            width: "100%",
          }}
          onClick={() => setSelectedTab("main")}
        >
          TOKEN
        </button>
        <button
          type="button"
          style={{
            backgroundColor: selectedTab === "farm" ? "#d461ff" : "",
            borderWidth: 0,
            borderRadius: "12px",
            color: selectedTab === "farm" ? "#fff" : "#000",
            padding: "5px 3px",
            width: "100%",
          }}
          onClick={() => setSelectedTab("farm")}
        >
          FARM
        </button>
        <button
          type="button"
          style={{
            backgroundColor: selectedTab === "vault" ? "#d461ff" : "",
            borderWidth: 0,
            borderRadius: "12px",
            color: selectedTab === "vault" ? "#fff" : "#000",
            padding: "5px 3px",
            width: "100%",
          }}
          onClick={() => setSelectedTab("vault")}
        >
          VAULT
        </button>
      </div>
    );
  };

  return (
    <div id="content" className="mt-4">
      <label
        className="textWhite center mb-2"
        style={{ fontSize: "40px", textAlign: "center" }}
      >
        <big>
          <b>DASHBOARD</b>
        </big>
      </label>
      {renderTabs()}

      <div style={{ display: selectedTab === "main" ? "block" : "none" }}>
        <TokenDashboard />
      </div>
      <div style={{ display: selectedTab === "farm" ? "block" : "none" }}>
        <FarmDashboard />
      </div>
      <div style={{ display: selectedTab === "vault" ? "block" : "none" }}>
        <VaultDashboard />
      </div>
    </div>
  );
}
