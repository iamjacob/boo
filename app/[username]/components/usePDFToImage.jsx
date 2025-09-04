"use client";
import { useState, useEffect } from "react";
// import * as pdfjsLib from "pdfjs-dist";

// ✅ Use the correct worker path
// pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";


//THIS needs much more performance testing and optimization

// Simple LRU cache implementation
class LRUCache {
  constructor(limit = 12) {
    this.limit = limit;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.limit) {
      // Remove least recently used
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
  clear() {
    this.cache.clear();
  }
}


const usePDFToImage = (pdfUrl) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0); // 0-100
  // LRU cache for page images (key: `${pageNum}@${scale}`)
  const cacheRef = useState(() => new LRUCache(12))[0];

  useEffect(() => {
    let isCancelled = false;
    cacheRef.clear(); // Clear cache when PDF changes

    const loadPDF = async () => {
      setIsLoading(true);
      setProgress(0);
      try {
        if (!pdfUrl) {
          console.error("PDF URL is not defined.");
          setIsLoading(false);
          setProgress(0);
          return;
        }

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          // Progress callback for PDF loading
          onProgress: (progressData) => {
            if (progressData && progressData.loaded && progressData.total) {
              setProgress(Math.round((progressData.loaded / progressData.total) * 100));
            }
          },
        });
        const pdf = await loadingTask.promise;

        if (!isCancelled) {
          setPdfDoc(pdf);
          setProgress(100);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        setProgress(0);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isCancelled = true;
      cacheRef.clear();
    };
  }, [pdfUrl, cacheRef]);


  const getPageImage = async (pageNum, scale = 2) => {
    // Prevent requesting a page image before the PDF is loaded
    if (!pdfDoc || isLoading) {
      // Silently skip if not loaded
      return null;
    }
    const cacheKey = `${pageNum}@${scale}`;
    const cached = cacheRef.get(cacheKey);
    if (cached) return cached;

    try {
      // Defensive: PDF pages are 1-based, so clamp pageNum
      const numPages = pdfDoc.numPages;
      if (pageNum < 0 || pageNum >= numPages) {
        // Silently skip invalid page requests
        return null;
      }
      const page = await pdfDoc.getPage(pageNum + 1); // pdfjs pages are 1-based
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL("image/png");
      cacheRef.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (error) {
      // Silently skip errors for invalid page requests
      return null;
    }
  };

  return { getPageImage, isLoading, progress };
};

export default usePDFToImage;
