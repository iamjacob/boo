"use client";
import { useState, useEffect } from "react";
import { client } from "./lib/meilisearchClient";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);


  const terms = ["boooks","authors","genres","tags","quotes","users"];
  const baseText = "Search ";
  const [displayText, setDisplayText] = useState("");
  const [termIndex, setTermIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

const [inputText, setInputText] = useState("");



  // Reset typewriter state when user types, and restart when cleared
  useEffect(() => {
    if (inputText.length > 0) {
      // Pause and reset typewriter when user types
      setCharIndex(0);
      setIsDeleting(false);
      setDisplayText("");
      return;
    }
    // Only run typewriter when input is empty
    const currentTerm = terms[termIndex];
    const fullText = baseText + currentTerm;
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(fullText.substring(0, baseText.length + charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else {
        setDisplayText(fullText.substring(0, baseText.length + charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }

      if (!isDeleting && charIndex === currentTerm.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      }

      if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTermIndex((prev) => (prev + 1) % terms.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, termIndex, inputText]);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // blink speed
    return () => clearInterval(cursorInterval);
  }, []);


  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);

    if (!q) return setResults([]);

    const index = client.index("movies");
    const searchResults = await index.search(q);
    setResults(searchResults.hits);
  };

  return (
    <div className="flex flex-col items-center w-[90vw] md:w-[60vw]">

{/* {ai/agent/mascot} */}

                <div className="TAG p-2 flex gap-1 items-center group cursor-pointer">
                    <div className="border border-2 border-red-500 h-2 w-2 rounded-full group-hover:animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="border border-2 border-red-500 h-3 w-3 rounded-full group-hover:animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="border border-2 border-red-500 h-2 w-2 rounded-full group-hover:animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  </div>


     <div className="search flex justify-around w-full">

                <div className={`w-full flex items-center ${results.length < 1 ? 'search__field' : 'search__field--open'} `}>
                  <input
                    className="search__field--input pl-1 py-1 flex-grow w-full outline-none"
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    // placeholder="Search Boooks"
                    autoFocus
                    // onFocus={}
                    placeholder={inputText.length === 0 && displayText}

                    />
                    {/* <div className="border border-2 border-black p-1 m-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

                    </div> */}
                </div>
                  
                </div> 

{/* categories */}

{results.length < 1 &&
(

  <div className="m-1
   flex w-full gap-2 justify-center md:justify-around overflow-hidden">
                <div className="quick-access-buttons flex gap-2 justify-center">
                  <div className="pill">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-sparkles-icon lucide-sparkles"
                      >
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                      <path d="M20 2v4" />
                      <path d="M22 4h-4" />
                      <circle cx="4" cy="20" r="2" />
                    </svg>{" "}
                    {/* Explore */}
                  </div>

                  <div className="pill">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal"
                      >
                      <path d="M10 5H3" />
                      <path d="M12 19H3" />
                      <path d="M14 3v4" />
                      <path d="M16 17v4" />
                      <path d="M21 12h-9" />
                      <path d="M21 19h-5" />
                      <path d="M21 5h-7" />
                      <path d="M8 10v4" />
                      <path d="M8 12H3" />
                    </svg>
                  </div>
                </div>

<div className="hidden md:flex justify-around flex-grow">

                {/* <div className="pill" onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                        );
                        }}>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-left-icon lucide-chevron-left"
                        >
                    <path d="m15 18-6-6 6-6" />
                    </svg>
                    </div> */}

                <div
                  id="categories-and-genres-pills"
                  className="categories-and-genres-pills flex gap-2"
                  >
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Non-fiction
                  </div>

                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Fiction
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Genre
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    year
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Pages
                  </div>

                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Countries
                  </div>

                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    origin
                  </div>

                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Poetry
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Drama
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    History
                  </div>
                  <div
                    className="pill"
                    onClick={(e) => {
                      (e.currentTarget).classList.toggle(
                        "pill-selected"
                      );
                    }}
                    >
                    Philosophy
                  </div>
                </div>
                {/* <div
                  className="pill p-[2px]"
                  // onClick={(e) =>{ console.log(document.getElementById("categories-and-genres-pills")?.lastChild.pop()) }}
                  >
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right-icon lucide-chevron-right"
                  >
                  <path d="m9 18 6-6-6-6" />
                  </svg>
                  </div> */}
              </div>
              </div>
)}

{/* {results.length}  */}

{results.length > 1 &&
      <div className="results--open flex flex-col w-[90vw] md:w-[50vw]">

        {/* lastResults.map */}

        {results.map((movie) => (
          <div
          key={movie.id}
            className="border-top shadow p-1 flex items-center"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-12 h-auto mb-2"
            />
            <div className="flex flex-col">

            <h2 className="font-bold text-lg">{movie.title}</h2>
            {/* <p className="text-sm mt-1">{movie.overview.length > 150 
              ? movie.overview.substring(0, 50) + "..." 
              : movie.overview}</p> */}

            <div className="flex">
            <p className="text-xs mt-2">
              Genres: {movie.genres.join(", ")}
            </p>
            <p className="text-xs">
              Release: {new Date(movie.release_date * 1000).getFullYear()}
            </p>
            </div>


            <ul className="bg-red-500 flex">
              <li><a href="">Save</a></li>
              <li><a href="">Care</a></li>
              <li><a href="">Add to Shelf</a></li>
            </ul>

            </div>
          </div>
        ))}
      </div>}

    </div>
  );
}
