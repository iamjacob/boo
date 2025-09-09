"use client";
import { useState, useEffect, useRef } from "react";
import { client } from "./lib/meilisearchClient";
import Image from "next/image";
import BoooksHeart from "./BoooksHeart";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const terms = ["boooks", "authors", "genres", "tags", "quotes", "users"];
  const baseText = "Search ";
  const [displayText, setDisplayText] = useState("");
  const [termIndex, setTermIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const [inputText, setInputText] = useState("");

  const [lang, setLang] = useState("en");

  const [sortBy, setSortBy] = useState("relevance");
  const [sortOrder, setSortOrder] = useState("desc");

  const [fictionSelected, setFictionSelected] = useState(false);
  const [nonFictionSelected, setNonFictionSelected] = useState(false);

  // USE THIS SMART AND NICE!
  const [lastResults, setLastResults] = useState([]);

// Add at the top of your component:
const [focusedIdx, setFocusedIdx] = useState(0);
const resultRefs = useRef([]);

// Add this useEffect inside your component:
useEffect(() => {
  if (!results.length) return;
  resultRefs.current = resultRefs.current.slice(0, results.length);
  const observer = new window.IntersectionObserver(
    (entries) => {
      // Find all intersecting entries
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Find the entry closest to the top
        const topEntry = visibleEntries.reduce((prev, curr) =>
          curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
        );
        setFocusedIdx(Number(topEntry.target.dataset.idx));
      }
    },
    {
      root: null,
      threshold: 0.1, // Lower threshold for earlier detection
    }
  );
  resultRefs.current.forEach((ref) => {
    if (ref) observer.observe(ref);
  });
  return () => {
    resultRefs.current.forEach((ref) => {
      if (ref) observer.unobserve(ref);
    });
    observer.disconnect();
  };
}, [results]);


  useEffect(() => {
    const detected = document.body.getAttribute("data-lang") || "en";
    setLang(detected);
  }, []);

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

  // Brug View Transitions API hvis muligt
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      setResults(searchResults.hits);
    });
  } else {
    setResults(searchResults.hits);
  }
};

  return (
    <div className="flex flex-col items-center w-[90vw] md:w-[40vw]">
      <div className="search flex flex-col justify-around w-full">
        <div
          className={`w-[90vw] md:w-[40vw] p-1 align-left flex flex-col items-center 
              ${results.length < 1 ? "search__field" : "search__field--open"}
              `}
        >
          <div className="flex w-full justify-between">
            <input
              className="m-1p-[8px] search__field--input pl-2 py-1 flex-grow w-full outline-none"
              type="text"
              value={query}
              onChange={handleSearch}
              //placeholder="Search Boooks"
              autoFocus
              //onFocus={}
              placeholder={inputText.length === 0 && displayText}
            />
            <div className="quick-access-buttons flex gap-2 m-1 justify-center">
              {results.length < 1 && (
                <div className="top-2 right-2">
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
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            id="categories-and-genres-pills"
            className="categories-and-genres-pills flex gap-1 p-1 justify-between w-full"
          >
            <div className="choosen flex gap-2">
              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                {/* <img src={`./flags/${lang}.svg`} alt="" /> */}
                <Image
                  src={`./flags/dk.svg`}
                  width="18"
                  height="12"
                  alt="det danske flag"
                />
              </div>
              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                {/* <img src={`./flags/${lang}.svg`} alt="" /> */}
                <Image
                  src={`./flags/gb.svg`}
                  width="18"
                  height="12"
                  alt="det engelske flag"
                />
              </div>
              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-down-icon lucide-chevron-down"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>

            <div className="flex gap-2 justify-right">
              <div className="pill">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-dot-icon lucide-dot"
                >
                  <circle cx="12.1" cy="12.1" r="1" />
                </svg>
                {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> */}
              </div>
              {results.length < 1 && (
                <div
                  className="pill"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle("pill-selected");
                    setNonFictionSelected(!nonFictionSelected);
                  }}
                >
                  Non-fiction
                </div>
              )}
              {results.length < 1 && (
                <div
                  className="pill"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle("pill-selected");
                    setFictionSelected(!fictionSelected);
                  }}
                >
                  Fiction
                </div>
              )}
            </div>
          </div>

          {/* {results.length > 1 && (
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
          )} */}
        </div>
      </div>

      {results.length < 1 && (
        <div className="flex w-full gap-2 flex-wrap justify-center md:justify-around overflow-hidden mt-1">
          {fictionSelected && (
            <>
              {[
                "Fantasy",
                "Science Fiction",
                "Mystery",
                "Romance",
                "Thriller",
                "Horror",
                "Historical",
                "Literary",
                "Adventure",
                "Young Adult",
              ].map((genre) => (
                <div
                  key={genre}
                  className="pill"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle("pill-selected");
                  }}
                >
                  {genre}
                </div>
              ))}
            </>
          )}

          {nonFictionSelected && (
            <>
              {[
                "Biography",
                "Memoir",
                "Self-Help",
                "History",
                "Science",
                "Travel",
                "True Crime",
                "Philosophy",
                "Politics",
                "Religion",
              ].map((genre) => (
                <div
                  key={genre}
                  className="pill"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle("pill-selected");
                  }}
                >
                  {genre}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Sorting buttons with chevron direction and state */}
      {results.length > 1 && (
        <div className="sorting w-full h-[40px] flex">
          <div className="flex gap-2 w-full m-2">
            {[
              { label: "Relevance", value: "relevance" },
              { label: "Year", value: "year" },
              { label: "Rating", value: "rating" },
              { label: "Popularity", value: "popularity" },
            ].map((sort) => (
              <button
                key={sort.value}
                className={`rounded p-1 flex items-center gap-1 text-[14px] text-gray-400 ${
                  sortBy === sort.value && "text-gray-900"
                }`}
                onClick={() => {
                  if (sortBy === sort.value) {
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
                    setSortBy(sort.value);
                    setSortOrder("desc");
                  }
                }}
              >
                {sort.label}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-icon"
                >
                  {sortBy === sort.value && sortOrder === "asc" ? (
                    <path d="m18 15-6-6-6 6" />
                  ) : (
                    <path d="m6 9 6 6 6-6" />
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* {results.length}  */}

      {results.length > 1 && (
        <div className="results--open flex flex-col w-[90vw] md:w-[40vw] max-h-[60vh] mb-2 overflow-auto">
          {/* lastResults.map */}
{results.map((movie, idx) => (
  <div
    key={movie.id}
    ref={el => resultRefs.current[idx] = el}
    data-idx={idx}
    className={`border-top shadow p-1 flex justify-between transition-all duration-500 ${idx === focusedIdx ? "focused-result" : ""}`}
    style={
      idx === focusedIdx
        ? { height: "220px", background: "#fffbe6", zIndex: 2 }
        : { height: "100px", zIndex: 1 }
    }
    {...(idx === focusedIdx
      ? {
          id: "focused-result",
          "data-view-transition-name": "focused-result",
        }
      : {})}
  >
    <img
      src={movie.poster}
      alt={movie.title}
      className={idx === focusedIdx ? "w-32 h-auto mb-2" : "w-12 h-auto mb-2"}
      {...(idx === focusedIdx
        ? { "data-view-transition-name": "focused-image" }
        : {})}
    />
              <div className="flex">
                <div className="flex flex-col">
                  <h2 className="font-bold text-lg">{movie.title}</h2>
                  <p className="text-sm mt-1">
                    {movie.overview.length > 50
                      ? movie.overview.substring(0, 50) + "..."
                      : movie.overview}
                  </p>

                  <div className="flex">
                    <p className="text-xs mt-2">
                      Genres: {movie.genres.join(", ")}
                    </p>
                    <p className="text-xs">
                      Release:{" "}
                      {new Date(movie.release_date * 1000).getFullYear()}
                    </p>
                  </div>
                </div>

                {/* quick action buttons*/}
                <div className="ml-4 flex justify-between items-center">
                  <ul className="flex gap-4 justify-around w-full">
                    <li>
                      <a href="#">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-share2-icon lucide-share-2"
                        >
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                          <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <BoooksHeart width="24" height="24" fill="#000000" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="lucide lucide-cross-icon lucide-cross"
                        >
                          <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="arrow bg-red-500 w-4 rounded m-2 flex align-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-down-icon lucide-chevron-down"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 text-[#ff000050] px-2 hidden">
        {/* <div className="pill">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-atom-icon lucide-atom"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>
      </div> */}
        <div className="pil">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff0000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-whole-word-icon lucide-whole-word"
          >
            <circle cx="7" cy="12" r="3" />
            <path d="M10 9v6" />
            <circle cx="17" cy="12" r="3" />
            <path d="M14 7v8" />
            <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
          </svg>
        </div>
        <div className="pil">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff000050"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-camera-icon lucide-camera"
          >
            <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </div>
       
        
      </div>
    </div>
  );
}
