import React from "react";
import BoooksFull from "./BoooksFull";

const Loading = ({ progress = 0 }) => {

  // const progress = ()=>{set}
  return (
    <div
      className="loader-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div className="fadeOut">
        <BoooksFull />
      </div>

      {/* Optional text */}
      <p style={{ marginTop: "20px", fontSize: "1.2rem" }}>
        {/* Loading...*/}
        {/* {progress}%  */}
      </p>

      {/* Progress bar */}
      <div
        className="loader-bar-container"
        style={{
          marginTop: "10px",
          width: "200px",
          height: "4px",
          background: "#eee",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          className="loader-bar"
          style={{
            width:'0%',
            // width: `${progress}%`,
            height: "100%",
            background: "#ff4500",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default Loading;
