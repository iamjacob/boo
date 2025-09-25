import React from "react";
//CHANGE THIS NAME TO FILTERS
import { useMenuStore } from "../../../stores/useMenuStore";

export default function Filter({
  books,
  selectedMainCat,
  setSelectedMainCat,
  selectedSubCat,
  setSelectedSubCat,
  onFilter,
}) {
  // Get all unique main categories
  const filter = useMenuStore((s) => s.FilterOpen);

  const mainCats = Array.from(
    new Set(books.flatMap((book) => book.categories?.main || []))
  );

  // Get all unique subcategories for the selected main category
  const filteredBooks =
    selectedMainCat === "All"
      ? books
      : books.filter((book) =>
          book.categories?.main?.includes(selectedMainCat)
        );
  const subCats = Array.from(
    new Set(filteredBooks.flatMap((book) => book.categories?.sub || []))
  );

  return (
  

    <div
      className={`category-slider transition-transform fixed bottom-0 left-0 w-full flex p-2 overflow-x-auto z-50 
        ${filter ? "bottom-[0px]" : "bottom-[-100px]"}
         transition-transform duration-500 ease-in-out gap-2`} // removed justify-center for natural scroll
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #222",
        WebkitOverflowScrolling: "touch"
      }}
    >
    <button
        key="All"
        className={`category-chip px-4 py-2 text-[13px] bg-black/80 backdrop-blur rounded-full border border-white/30 text-white whitespace-nowrap flex-shrink-0${
          selectedMainCat === "All" ? " ring-2 ring-white" : ""
        }`}
        style={{
          fontWeight: "500",
          lineHeight: "1",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
        onClick={() => {
          setSelectedMainCat("All");
          setSelectedSubCat(null);
          onFilter("All", null);
        }}
      >
        All <span style={{ fontWeight: "bold" }}>({books.length})</span>
      </button>


      {mainCats.map((cat) => {
        const count = books.filter((book) =>
          book.categories?.main?.includes(cat)
        ).length;
        return (
          <button
            key={cat}
            className={`category-chip cursor-pointer px-4 py-2 text-[13px] bg-black/80 backdrop-blur rounded-full border border-white/30 text-white whitespace-nowrap flex-shrink-0${
              selectedMainCat === cat ? " ring-2 ring-white" : ""
            }`}
            style={{
              fontWeight: "500",
              lineHeight: "1",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
            onClick={() => {
              setSelectedMainCat(cat);
              setSelectedSubCat(null);
              onFilter(cat, null);
            }}
          >
            {cat} <span style={{ fontWeight: "bold" }}>({count})</span>
          </button>
        );
      })}
   

           {/* Subcategory bar */}
      {/* {selectedMainCat !== "All" && subCats.length > 0 && (
        <div className="flex flex-row gap-1 mt-2">
          {subCats.map(sub => {
            const count = filteredBooks.filter(book => book.categories?.sub?.includes(sub)).length;
            return (
              <button
                key={sub}
                className={`p-1 text-[10px] bg-gray-700/80 rounded-lg border border-white/30 text-white${selectedSubCat === sub ? ' ring-2 ring-white' : ''}`}
                onClick={() => {
                  setSelectedSubCat(sub);
                  onFilter(selectedMainCat, sub);
                }}
              >
                {sub} <span style={{ fontWeight: 'bold' }}>({count})</span>
              </button>
            );
          })}
        </div>
      )}  */}
      </div>
  );
}
