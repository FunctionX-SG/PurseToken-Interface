import React from "react";
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTelegram,
  FaReddit,
  FaMedium,
} from "react-icons/fa";
import { AiFillMail } from "react-icons/ai";
import { MdForum } from "react-icons/md";
import { FaXTwitter } from "react-icons/fa6";
import { FaMediumM } from "react-icons/fa";
import { RiNotionFill } from "react-icons/ri";

import "../App.css";

export default function Footer() {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#181818",
        textAlign: "center",
        color: "white",
        padding: "35px 10px",
        marginTop: "100px",
      }}
    >
      <div className="mb-3 copyright-pry" style={{ fontSize: "12px" }}>
        Copyright © 2023-2024 PURSE®
      </div>
      <div style={{ fontSize: "20px", cursor: "pointer" }}>
        <FaXTwitter
          onClick={() => {
            window.open(`https://twitter.com/Purse_Land`, "_blank");
          }}
        />
        &nbsp;&nbsp;
        <FaYoutube
          onClick={() => {
            window.open(
              `https://www.youtube.com/channel/UCOIf6WeLEzZi3DQxzenTZeA`,
              "_blank"
            );
          }}
          style={{ marginLeft: "20px" }}
        />
        &nbsp;&nbsp;
        <FaMediumM
          onClick={() => {
            window.open(`https://medium.com/pundix`, "_blank");
          }}
          style={{ marginLeft: "20px" }}
        />
        &nbsp;&nbsp;
        <img
          src="https://purse.land/assets/img-social-coingecko-6a575d7a.svg"
          onClick={() => {
            window.open(
              "https://www.coingecko.com/en/coins/pundi-x-purse",
              "_blank"
            );
          }}
          style={{ marginLeft: "20px" }}
        ></img>
        &nbsp;&nbsp;
        <img
          src="https://purse.land/assets/img-social-gitbook-b2bf3331.svg"
          onClick={() => {
            window.open("https://pundix-purse.gitbook.io/untitled", "_blank");
          }}
          style={{ marginLeft: "20px" }}
        ></img>
        &nbsp;&nbsp;
        <RiNotionFill
          onClick={() => {
            window.open(
              `https://purseplus.notion.site/c7fd0280bbf0498c9753f0f772bbc98c`,
              "_blank"
            );
          }}
          style={{ marginLeft: "20px" }}
        />
      </div>
    </div>
  );
}
