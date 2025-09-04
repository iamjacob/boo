"use client";
import { useEffect, useRef, useState } from "react";
import "./thumbMenu.css";
import { gsap } from "gsap";
import useShelvesStore from "../../../../../stores/shelves/useShelvesStore";

export default function ThumbMenu() {
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);

  const MENU_ITEMS = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M280-160v-441q0-33 24-56t57-23h439q33 0 56.5 23.5T880-600v320L680-80H360q-33 0-56.5-23.5T280-160ZM81-710q-6-33 13-59.5t52-32.5l434-77q33-6 59.5 13t32.5 52l10 54h-82l-7-40-433 77 40 226v279q-16-9-27.5-24T158-276L81-710Zm279 110v440h280v-160h160v-280H360Zm220 220Z" />
        </svg>
      ),
      label: "More",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M320-320h480v-480h-80v280l-100-60-100 60v-280H320v480Zm0 80q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm360-720h200-200Zm-200 0h480-480Z" />
        </svg>
      ),
      label: "Collections",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
      ),
      label: "Search",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M240-80q-33 0-56.5-23.5T160-160v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-80H240Zm-80-440v-280q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v280h-80ZM40-360v-80h880v80H40Zm440-160Zm0 240Z" />
        </svg>
      ),
      label: "Scan",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
        </svg>
      ),
      label: "Settings",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M280-160v-441q0-33 24-56t57-23h439q33 0 56.5 23.5T880-600v320L680-80H360q-33 0-56.5-23.5T280-160ZM81-710q-6-33 13-59.5t52-32.5l434-77q33-6 59.5 13t32.5 52l10 54h-82l-7-40-433 77 40 226v279q-16-9-27.5-24T158-276L81-710Zm279 110v440h280v-160h160v-280H360Zm220 220Z" />
        </svg>
      ),
      label: "More",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M320-320h480v-480h-80v280l-100-60-100 60v-280H320v480Zm0 80q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm360-720h200-200Zm-200 0h480-480Z" />
        </svg>
      ),
      label: "Collections",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
        </svg>
      ),
      label: "Search",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#fff"
        >
          <path d="M240-80q-33 0-56.5-23.5T160-160v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-80H240Zm-80-440v-280q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v280h-80ZM40-360v-80h880v80H40Zm440-160Zm0 240Z" />
        </svg>
      ),
      label: "Scan",
    }
  ];

  const { shelves, selectedShelf, setSelectedShelf } = useShelvesStore();

  let isDragging = false;
  let startY = 0;
  let currentY = 0;

  let scrollOffset = 0;

  const radialSlots = [
    [320, 40],
    [270, 0],
    [200, 8],
    [170, 40],
    [180, 90],
    [210, 145],
    [260, 180],
    [340, 205],
    [370, 290],
  ];

  const scaleMap = [1.1, 1.05, 0.95, 0.85, 0.8, 0.85, 0.95, 1.05, 1.1];

  const applyRadialLayout = () => {
    const items = menuItemsRef.current.filter(Boolean);
    const slotCount = radialSlots.length;

    items.forEach((el, i) => {
      const slotIndex = (i + scrollOffset) % slotCount;
      const [x, y] = radialSlots[slotIndex];

      gsap.to(el, {
        x,
        y,
        scale: scaleMap[slotIndex],
        opacity: Math.max(0.5, scaleMap[slotIndex] - 0.1),
        duration: 0.4,
        ease: "power2.out",
      });
    });
  };

  const highlightCenterElement = () => {
    if (menuItemsRef.current.length === 0) return;

    const menuElementTop = menuRef.current?.getBoundingClientRect()?.top || 0;
    const menuElementHeight = menuRef.current?.clientHeight || 0;
    const menuElementMiddle = menuElementTop + menuElementHeight / 2;

    let currentHighlightedItem = null;

    menuItemsRef.current.forEach((item) => {
      if (!item) return;
      const itemRect = item.getBoundingClientRect();
      const itemMiddle = itemRect.top + itemRect.height / 2;

      if (Math.abs(itemMiddle - menuElementMiddle) < itemRect.height / 2) {
        item.classList.add("highlight");
        currentHighlightedItem = item;
      } else {
        item.classList.remove("highlight");
      }
    });

    if (
      currentHighlightedItem &&
      currentHighlightedItem !== highlightCenterElement.last
    ) {
      const shelfName =
        currentHighlightedItem.querySelector(".item-shelf")?.innerText;
      const shelfObject = shelves.find((shelf) => shelf.name === shelfName);

      if (shelfObject && (!selectedShelf || selectedShelf.name !== shelfName)) {
        setSelectedShelf(shelfObject);
      }

      highlightCenterElement.last = currentHighlightedItem;
    }
  };

  const onWheelScroll = (event) => {
    scrollOffset += event.deltaY > 0 ? 1 : -1;
    scrollOffset = (scrollOffset + radialSlots.length) % radialSlots.length;
    applyRadialLayout();
    highlightCenterElement();
  };

  const onDragStart = (event) => {
    startY = event.clientY || event.touches[0].clientY;
    isDragging = true;
    menuRef.current?.classList.add("is-dragging");
  };

  const onDragMove = (event) => {
    if (!isDragging) return;
    currentY = event.clientY || event.touches[0].clientY;
    const deltaY = currentY - startY;

    if (Math.abs(deltaY) > 30) {
      scrollOffset -= deltaY > 0 ? -1 : 1;
      scrollOffset = (scrollOffset + radialSlots.length) % radialSlots.length;
      applyRadialLayout();
      highlightCenterElement();
      startY = currentY;
    }
  };

  const onDragEnd = () => {
    isDragging = false;
    menuRef.current?.classList.remove("is-dragging");
  };

  useEffect(() => {
    if (shelves.length > 0) {
      applyRadialLayout();
      highlightCenterElement();
    }
  }, [shelves]);

  return (
    <div
      className="thumb-picker-menu-container"
      ref={menuRef}
      onWheel={onWheelScroll}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
    >
      <ul className="thumb-menu-wrapper">
        {MENU_ITEMS.map((item, index) => (
          <li
            key={index}
            className="thumb-menu-item"
            ref={(el) => (menuItemsRef.current[index] = el)}
          >
            <button className="thumb-menu-button">
              {item.icon}
              <span className="thumb-menu-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
