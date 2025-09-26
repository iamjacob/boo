"use client";
import { useState, useEffect, useRef } from "react";
import { client } from "./lib/meilisearchClient";
import Image from "next/image";
import BoooksHeart from "./BoooksHeart";
import { div } from "three/tsl";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  const terms = [
    "Lets get more enlightened together...",
    "",
    "Books series..",
    "users",
    "authors",
    "genres",
    "#tags",
    "quotes",
    "words",
    "Swipe for camera",
    "doubletap for voice",
  ];
  const baseText = "";
  const [displayText, setDisplayText] = useState("");
  const [termIndex, setTermIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [keyboard, setKeyboard] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isPrivate, setPrivate] = useState(false);

  const [more, setMore] = useState(false);
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
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Find the entry closest to the top
          const topEntry = visibleEntries.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top
              ? curr
              : prev
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

    // Load offline data
    const loadOfflineData = async () => {
      try {
        // Load users data
        const usersResponse = await fetch("/users.json");
        const userData = await usersResponse.json();
        setUsers(userData);

        // Load books/movies data for offline use
        const booksResponse = await fetch("/movies.json");
        const booksData = await booksResponse.json();
        setBooks(booksData);

        console.log("Offline data loaded successfully");
      } catch (error) {
        console.error("Failed to load offline data:", error);
      }
    };

    loadOfflineData();
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

    // Search users (always works offline)
    const userResults = users
      .filter((user) => {
        const searchTerm = q.toLowerCase();
        return (
          user.username.toLowerCase().includes(searchTerm) ||
          user.displayName.toLowerCase().includes(searchTerm) ||
          user.bio.toLowerCase().includes(searchTerm) ||
          user.favoriteGenres.some((genre) =>
            genre.toLowerCase().includes(searchTerm)
          ) ||
          user.currentlyReading.toLowerCase().includes(searchTerm)
        );
      })
      .map((user) => ({ ...user, type: "user" }));

    let bookResults = [];

    try {
      // Try MeiliSearch first
      const index = client.index("movies");
      const searchResults = await index.search(q);
      bookResults = searchResults.hits.map((item) => ({
        ...item,
        type: "book",
      }));
      setIsOnline(true);
    } catch (error) {
      console.error("MeiliSearch offline, using local search:", error);
      setIsOnline(false);

      // Fallback to local book search
      bookResults = books
        .filter((book) => {
          const searchTerm = q.toLowerCase();
          return (
            book.title?.toLowerCase().includes(searchTerm) ||
            book.author?.toLowerCase().includes(searchTerm) ||
            book.description?.toLowerCase().includes(searchTerm) ||
            book.genre?.toLowerCase().includes(searchTerm) ||
            book.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
          );
        })
        .slice(0, 20)
        .map((item) => ({ ...item, type: "book" })); // Limit results similar to MeiliSearch
    }

    // Combine results - users first, then books/movies
    const combinedResults = [...userResults, ...bookResults];

    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setResults(combinedResults);
      });
    } else {
      setResults(combinedResults);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90vw] md:w-[40vw]">
      <div className="search flex flex-col justify-around w-full">
        <div
          className={`w-[90vw] md:w-[40vw] p-1 align-left flex flex-col items-center bg-[rgba(255,255,255,.8)] 
              ${results.length < 1 ? "search__field" : "search__field--open"}
              ${isPrivate && `search__field--private bg-black`}
              `}
        >
          <div className="flex w-full justify-between">
            <input
              className={`m-1p-[8px] search__field--input pl-2 py-1 flex-grow w-full outline-none ${
                isPrivate ? 'placeholder-gray-300' : 'placeholder-gray-500'
              }`}
              type="text"
              value={query}
              onChange={handleSearch}
              //placeholder="Search Boooks"
              autoFocus
              //onFocus={}
              placeholder={inputText.length === 0 && displayText}
            />
             <div className="flex">
            <div 
              onClick={() => {
                setPrivate(!isPrivate);
              }}
              className={`private-ghost-indicator flex items-center gap-1 p-1 text-xs `}>


<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={!isPrivate ? "#999" : "white"}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-ghost-icon lucide-ghost"
            >
              <path d="M9 10h.01" />
              <path d="M15 10h.01" />
              <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
            </svg>
</div>
</div>
 {/* 
            {query && !isOnline ? (

              <div className="offline-indicator flex items-center gap-1 text-yellow-800 text-xs rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  viewBox="0 -960 960 960"
                  width="18"
                  fill="#1f1f1f"
                >
                  <path d="M819-28 701-146q-48 32-103.5 49T480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-62 17-117.5T146-701L27-820l57-57L876-85l-57 57ZM440-162v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm374-99-58-58q21-37 32.5-77.5T800-480q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v45L261-814q48-31 103-48.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 61-17.5 116T814-261Z" />
                </svg>
              </div>
            ) : (
              <div className="online-indicator flex items-center gap-1 text-green-800 text-xs rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18px"
                  viewBox="0 -960 960 960"
                  width="18"
                  fill="#1f1f1f"
                >
                  <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q41-45 62.5-100.5T800-480q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
                </svg>
              </div>
            )}
            </div> */}
                  
          </div>


          
          <div className="flex w-full justify-end">
            <div
              onClick={() => {
                setMore(!more);
              }}
              className="rotate-90 p-1"
            >
              {more ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  width="24px"
                  viewBox="0 -960 960 960"
                  fill="#999 "
                >
                  <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#999 "
                  
                >
                  <path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" />
                </svg>
              )}
            </div>
          </div>

          {/* 
          {more && (
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
          )} */}

          {more && (
            <>
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
                    <img src={`./flags/${lang}.svg`} alt="" />
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
                    <img src={`./flags/${lang}.svg`} alt="" />
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-dot-icon lucide-dot"
                    >
                      <circle cx="12.1" cy="12.1" r="1" />
                    </svg>
                  </div>

                  <div
                    onClick={() => {
                      setKeyboard(!keyboard);
                    }}
                    className="pill"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="#000"
                    >
                      <path d="M160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h640q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H160Zm0-80h640v-400H160v400Zm160-40h320v-80H320v80ZM200-440h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80ZM200-560h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80Zm120 0h80v-80h-80v80ZM160-280v-400 400Z" />
                    </svg>
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
                      class="lucide lucide-mic-icon lucide-mic"
                    >
                      <path d="M12 19v3" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <rect x="9" y="2" width="6" height="13" rx="3" />
                    </svg>
                  </div>
                  <div className="pill">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-camera-icon lucide-camera"
                    >
                      <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <div className="pill">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-whole-word-icon lucide-whole-word"
                    >
                      <circle cx="7" cy="12" r="3" />
                      <path d="M10 9v6" />
                      <circle cx="17" cy="12" r="3" />
                      <path d="M14 7v8" />
                      <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
                    </svg>
                  </div>
                </div>
              </div>

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
            </>
          )}
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
        </div>
      </div>

      {/* {keyboard && (
        <div className="pill">
a
        </div>
      )} */}






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
          {results.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}`}
              ref={(el) => (resultRefs.current[idx] = el)}
              data-idx={idx}
              className={`border-top shadow p-1 flex justify-between transition-all duration-500 ${
                idx === focusedIdx ? "focused-result" : ""
              }`}
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
              {item.type === "user" ? (
                // User result layout
                <>
                  <img
                    src={item.avatar}
                    alt={item.displayName}
                    className={`rounded-full ${
                      idx === focusedIdx ? "w-20 h-20 mb-2" : "w-12 h-12 mb-2"
                    }`}
                    {...(idx === focusedIdx
                      ? { "data-view-transition-name": "focused-image" }
                      : {})}
                  />
                  <div className="flex flex-grow">
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg">
                          {item.displayName}
                        </h2>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          USER
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">@{item.username}</p>
                      <p className="text-sm mt-1">
                        {item.bio.length > 50
                          ? item.bio.substring(0, 50) + "..."
                          : item.bio}
                      </p>
                      {idx === focusedIdx && (
                        <div className="mt-2">
                          <p className="text-xs">
                            📚 {item.booksRead} books read
                          </p>
                          <p className="text-xs">📍 {item.location}</p>
                          <p className="text-xs">
                            📖 Currently reading: {item.currentlyReading}
                          </p>
                          <p className="text-xs">
                            👥 {item.followers} followers, {item.following}{" "}
                            following
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-1">
                        {item.favoriteGenres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* User action buttons */}
                    <div className="ml-4 flex justify-between items-center">
                      <ul className="flex gap-4 justify-around w-full">
                        <li>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="m19 8 2 2-2 2" />
                              <path d="m17 10h4" />
                            </svg>
                          </button>
                        </li>
                        <li>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                // Book/movie result layout (existing code)
                <>
                  <img
                    src={item.poster}
                    alt={item.title}
                    className={
                      idx === focusedIdx
                        ? "w-32 h-auto mb-2"
                        : "w-12 h-auto mb-2"
                    }
                    {...(idx === focusedIdx
                      ? { "data-view-transition-name": "focused-image" }
                      : {})}
                  />
                  <div className="flex">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg">{item.title}</h2>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          BOOK
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        {item.overview.length > 50
                          ? item.overview.substring(0, 50) + "..."
                          : item.overview}
                      </p>

                      <div className="flex">
                        <p className="text-xs mt-2">
                          Genres: {item.genres.join(", ")}
                        </p>
                        <p className="text-xs">
                          Release:{" "}
                          {new Date(item.release_date * 1000).getFullYear()}
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
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-share2-icon lucide-share-2"
                            >
                              <circle cx="18" cy="5" r="3" />
                              <circle cx="6" cy="12" r="3" />
                              <circle cx="18" cy="19" r="3" />
                              <line
                                x1="8.59"
                                x2="15.42"
                                y1="13.51"
                                y2="17.49"
                              />
                              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                            </svg>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <BoooksHeart
                              width="24"
                              height="24"
                              fill="#000000"
                            />
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
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
