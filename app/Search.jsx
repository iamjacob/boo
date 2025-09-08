"use client";
import { useState, useEffect } from "react";
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
    setResults(searchResults.hits);
  };

  return (
    <div className="flex flex-col items-center w-[90vw] md:w-[40vw]">
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
      <div className="flex mb-4 gap-4 w-full justify-center">
        <div
          className="pill"
          onClick={(e) => {
            e.currentTarget.classList.toggle("pill-selected");
            setNonFictionSelected(!nonFictionSelected);
          }}
        >
          Non-fiction
        </div>

        <div
          className="pill"
          onClick={(e) => {
            e.currentTarget.classList.toggle("pill-selected");
            setFictionSelected(!fictionSelected);
          }}
        >
          Fiction
        </div>
      </div>

      <div className="search flex justify-around w-full">
        <div
          className={`w-[90vw] md:w-[40vw] p-1 align-left w- flex flex-col items-center ${
            results.length < 1 ? "search__field" : "search__field--open"
          } `}
        >
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

          <div
            id="categories-and-genres-pills"
            className="categories-and-genres-pills flex gap-2"
          >
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

          <div className="quick-access-buttons flex gap-2 m-1 justify-center">
            {results.length < 1 && (
              <div className="relative top-2 right-2">
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
                  {/* Explore */}
                </div>
              </div>
            )}

            {results.length > 1 && (
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
            )}
          </div>
        </div>

        {/* Sorting buttons with chevron direction and state */}
        {results.length > 1 && (
          <div className="sorting w-full flex">
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

        {/* 
              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                Year
              </div>
              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                Pages
              </div>

              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                Countries
              </div>

              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                origin
              </div>

              <div
                className="pill"
                onClick={(e) => {
                  e.currentTarget.classList.toggle("pill-selected");
                }}
              >
                Philosophy
              </div> */}
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
      )}

      {/* {results.length}  */}

      {results.length > 1 && (
        <div className="results--open flex flex-col w-[90vw] md:w-[40vw] max-h-[80vh] mb-2 overflow-y-scroll">
          {/* lastResults.map */}

          {results.map((movie) => (
            <div
              key={movie.id}
              className="border-top shadow p-1 flex justify-between"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-12 h-auto mb-2"
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
    </div>
  );
}
