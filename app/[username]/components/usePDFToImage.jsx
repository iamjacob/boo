"use client";
import { useState, useEffect } from "react";

// Simple LRU cache implementation
class LRUCache {
  constructor(limit = 28) {
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
  const [progress, setProgress] = useState(0);
  const cacheRef = useState(() => new LRUCache(12))[0];
  const [pdfjsLib, setPdfjsLib] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    cacheRef.clear();

    const initPDFJS = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // ✅ Try loading via script tag method instead of dynamic import
        if (!window.pdfjsLib) {
          // Load from CDN first to avoid bundling issues
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              setPdfjsLib(window.pdfjsLib);
            }
          };
          document.head.appendChild(script);
        } else {
          setPdfjsLib(window.pdfjsLib);
        }
      } catch (error) {
        console.error("Error initializing PDF.js:", error);
      }
    };

    initPDFJS();
  }, []);

  useEffect(() => {
    let isCancelled = false;
    cacheRef.clear();

    const loadPDF = async () => {
      if (!pdfjsLib || !pdfUrl) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProgress(0);
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
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
  }, [pdfUrl, pdfjsLib, cacheRef]);

  const getPageImage = async (pageNum, scale = 2) => {
    if (!pdfDoc || isLoading || !pdfjsLib) {
      return null;
    }
    
    const cacheKey = `${pageNum}@${scale}`;
    const cached = cacheRef.get(cacheKey);
    if (cached) return cached;

    try {
      const numPages = pdfDoc.numPages;
      if (pageNum < 0 || pageNum >= numPages) {
        return null;
      }
      
      const page = await pdfDoc.getPage(pageNum + 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL("image/webp");
      cacheRef.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (error) {
      return null;
    }
  };

  return { getPageImage, isLoading, progress };
};

export default usePDFToImage;