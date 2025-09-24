import React from "react";

import { useMenuStore } from "../../../stores/useMenuStore";

export default function Menu({
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
      className={`fixed m-2 z-100 ${
        filter ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-500 ease-in-out z-50 bottom-16 left-0 flex gap-1 justify-center`}
    >
      <button
        key="All"
        className={`p-1 text-[10px] bg-black-700/80 backdrop-blur rounded-lg border border-white/30 text-white${
          selectedMainCat === "All" ? " ring-2 ring-white" : ""
        }`}
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
            className={`p-1 text-[12px] h-[40px] backdrop-blur rounded-lg border border-white/30 text-white${
              selectedMainCat === cat ? " ring-2 ring-white" : ""
            }`}
            onClick={() => {
              setSelectedMainCat(cat);
              setSelectedSubCat(null);
              onFilter(cat, null);
            }}
          >
            {cat} {count}
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
      )} */}
    </div>
  );
}
