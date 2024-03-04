import React from "react";
import MediaQuery from "react-responsive";
import red from "../../assets/images/red.png";
import blue from "../../assets/images/blue.png";
import green from "../../assets/images/green.png";
import orange from "../../assets/images/orange.png";
import purple from "../../assets/images/purple.png";

export default function PurseBox() {

  const renderMintButton = () => {
    return (
      <div className="pt-2 pb-2" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', // This is optional if you want to also vertically center it within a taller container.
      }}>
        <button
          type="button"
          style={{
            backgroundColor: "#d461ff",
            borderWidth: 0,
            borderRadius: "12px",
            color: "#fff",
            padding: "5px 3px",
            width: "85%"
          }}
        >
          <big>
            MINT PURSE BOX
          </big>
        </button>
      </div>
    )
  }
  const renderWeb = () => {
    return (
      <div style={{margin: "0 auto", maxWidth: "1000px"}}>
        <div id="content" className="mt-4">
          {/*<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>*/}
          <div className="center img"> {/*className="left img" style={{marginRight: '20px'}}*/}
            <img src={purple} height="180" alt=""/>
          </div>
          <label
            className="textWhite center"
            style={{fontSize: "40px", textAlign: "center"}}
          >
            <big>
              <b>PURSE BOX</b>
            </big>
          </label>
          {/*</div>*/}
          <div className="textMedium pt-4">
            <big>
              <span className="textWhiteMedium">PURSE</span> adopts the experimental <span
              className="textWhiteMedium">ERC404</span>,
              merging <span className="textWhiteMedium">ERC20</span> and <span
              className="textWhiteMedium">ERC721</span> features.
              This innovation offers a user "<span className="textWhiteMedium">option</span>" switch for transitioning
              between token
              types, mitigating high fees and enhancing exchange integration. This step signifies <span
              className="textWhiteMedium">PURSE</span>'s
              commitment to broadening digital asset utility and innovation.
            </big>
          </div>
          <div className="textWhiteSmall pt-4">
            <p>
              Sample PURSE404 NFTs:
            </p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="center img">
              <img src={red} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={green} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={blue} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={orange} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={purple} height="180" alt=""/>
            </div>
          </div>
          <div className="pt-4">
            {renderMintButton()}
          </div>
        </div>
      </div>
    );
  }

  const renderMobile = () => {
    return (
      <div style={{margin: "0 auto", maxWidth: "300px"}}>
        <div id="content" className="mt-4">
          {/*<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>*/}
          <div className="center img"> {/*className="left img" style={{marginRight: '20px'}}*/}
            <img src={purple} height="180" alt=""/>
          </div>
          <label
            className="textWhite center"
            style={{fontSize: "40px", textAlign: "center"}}
          >
            <big>
              <b>PURSE BOX</b>
            </big>
          </label>
          <div className="textMedium pt-4">
            <big>
              <span className="textWhiteMedium">PURSE</span> adopts the experimental <span
              className="textWhiteMedium">ERC404</span>,
              merging <span className="textWhiteMedium">ERC20</span> and <span
              className="textWhiteMedium">ERC721</span> features.
              This innovation offers a user "<span className="textWhiteMedium">option</span>" switch for transitioning
              between token
              types, mitigating high fees and enhancing exchange integration. This step signifies <span
              className="textWhiteMedium">PURSE</span>'s
              commitment to broadening digital asset utility and innovation.
            </big>
          </div>
          <div className="textWhiteSmall pt-4">
            <p>
              Sample PURSE404 NFTs:
            </p>
          </div>
          <div style={{display: 'block', alignItems: 'center', justifyContent: 'center'}}>
            <div className="center img">
              <img src={red} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={green} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={blue} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={orange} height="180" alt=""/>
            </div>
            <div className="center img">
              <img src={purple} height="180" alt=""/>
            </div>
          </div>
          <div>
            {renderMintButton()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <MediaQuery minWidth={601}>
        {renderWeb()}
      </MediaQuery>
      <MediaQuery maxWidth={600}>
        {renderMobile()}
      </MediaQuery>
    </div>
  );
}

