import React, { useEffect, useState } from "react";

const ProgressBars = () => {
    const [openIndex, setOpenIndex] = useState(0); // which steps-holder is expanded (0 = first)
  const frames = ["⠖", "⠴", "⠦", "⠲"];
  const [loader, setLoader] = useState(frames[0]);

  // Loader animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoader((prev) => frames[(frames.indexOf(prev) + 1) % frames.length]);
    }, 80);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="progressbars">
        <div className="progressHolder">
          <svg
            role="progressbar"
            viewBox="0 0 24 24"
            aria-valuenow="0.16666666666666666"
            aria-valuemin="0"
            aria-valuemax="1"
            className="shrink-0 text-fd-primary"
          >
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              strokeWidth="2"
              stroke="#ff000030"
              className="stroke-current/25"
            ></circle>
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              strokeWidth="2"
              stroke="red"
              strokeDasharray="69.11503837897544"
              strokeDashoffset="57.59586531581287"
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
              className="transition-all"
            ></circle>
          </svg>
          <div>Cover</div>
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide shrink-0 transition-transform mx-0.5"
            onClick={() => setOpenIndex(openIndex === 0 ? null : 0)}
            style={{ cursor: "pointer", transform: openIndex === 0 ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </div>
        <div className={"steps-holder " + (openIndex === 0 ? "" : "collapsed")}>
          <div className="progression"></div>
          <div className="steps-text">
            <p><i className="size-[.8rem]">{loader}</i> Front </p>
            <p>Spine</p>
            <p>Back</p>
            <p>Barcode/ISBN</p>
            <p>Dimensions</p>
          </div>
        </div>
        <div className="progressHolder">
          <svg
            role="progressbar"
            viewBox="0 0 24 24"
            aria-valuenow="0.16666666666666666"
            aria-valuemin="0"
            aria-valuemax="1"
            className="shrink-0 text-fd-primary"
          >
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              strokeWidth="2"
              stroke="#ff000030"
              className="stroke-current/25"
            ></circle>
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              strokeWidth="2"
              stroke="red"
              strokeDasharray="69.11503837897544"
              strokeDashoffset="57.59586531581287"
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
              className="transition-all"
            ></circle>
          </svg>
          <div>Info</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide shrink-0 transition-transform mx-0.5"
            onClick={() => setOpenIndex(openIndex === 1 ? null : 1)}
            style={{ cursor: "pointer", transform: openIndex === 1 ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </div>
        <div className={"steps-holder " + (openIndex === 1 ? "" : "collapsed")}>
          <div className="progression"></div>
          <div className="steps-text">
            <p>Title</p>
            <p>Author</p>
            <p>Year</p>
            <p>Language</p>
            <p>Publication</p>
            <p>Format</p>
          </div>
        </div>
        <div className="progressHolder">
          <svg
            role="progressbar"
            viewBox="0 0 24 24"
            aria-valuenow="0.16666666666666666"
            aria-valuemin="0"
            aria-valuemax="1"
            class="shrink-0 text-fd-primary"
          >
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              stroke-width="2"
              stroke="#ff000030"
              class="stroke-current/25"
            ></circle>
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              stroke-width="2"
              stroke="red"
              stroke-dasharray="69.11503837897544"
              stroke-dashoffset="57.59586531581287"
              stroke-linecap="round"
              transform="rotate(-90 12 12)"
              class="transition-all"
            ></circle>
          </svg>
          <div>Classification</div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide shrink-0 transition-transform mx-0.5"
            onClick={() => setOpenIndex(openIndex === 2 ? null : 2)}
            style={{ cursor: "pointer", transform: openIndex === 2 ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </div>
        <div className={"steps-holder " + (openIndex === 2 ? "" : "collapsed")}>
          <div className="progression"></div>
          <div className="steps-text">
            <p>Genre</p>
            <p>Subcategory</p>
            <p>Tags</p>
            <p>Rating</p>
            <p>Quotes</p>
            <p>Notes</p>
          </div>
        </div>
      </div>
  )
}

export default ProgressBars

