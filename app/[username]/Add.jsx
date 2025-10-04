import React, { useRef, useState } from 'react'
import { useBooksStore } from '../../stores/useBooksStore'
import { useMenuStore } from '../../stores/useMenuStore'
import gsap from 'gsap'
import { 
  Search, 
  Upload, 
  Link, 
  Camera, 
  X, 
  BookOpen,
  Plus,
  ArrowRight
} from 'lucide-react'

const Add = () => {
  const [bookTitle, setBookTitle] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const addBook = useBooksStore((s) => s.addBook);
  const { setAdd } = useMenuStore();
  const inputRef = useRef();

  const handleClose = () => {
    setAdd(false);
  };

  const addMethods = [
    {
      id: 'search',
      title: 'Search Library',
      description: 'Find books from our database',
      icon: Search,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'upload',
      title: 'Upload Image',
      description: 'Upload book cover image',
      icon: Upload,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'url',
      title: 'From URL',
      description: 'Add book from web link',
      icon: Link,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'camera',
      title: 'Take Photo',
      description: 'Scan with your camera',
      icon: Camera,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setIsAnimating(true);
    
    // Add some interaction feedback
    setTimeout(() => {
      console.log(`Selected method: ${method.title}`);
      // Here you would navigate to the specific add flow
      // For now, just reset
      setIsAnimating(false);
    }, 500);
  };

  const handleAdd = () => {
    if (!bookTitle.trim()) return;
    const newBook = {
      id: Date.now().toString(),
      title: bookTitle,
      position: { x: 0.1, y: 0.1, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { width: 1, height: 1.5, thickness: 0.2 },
      cover: { front: "./books/learningweb.webp" },
    };
    addBook(newBook);
    setBookTitle("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Main overlay container */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-2xl w-full relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-full">
              <BookOpen className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white">Add New Book</h2>
          </div>
          <p className="text-white/70 text-lg">Choose how you'd like to add your book</p>
        </div>

        {/* Method selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {addMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod?.id === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method)}
                disabled={isAnimating}
                className={`
                  group relative p-6 rounded-xl bg-gradient-to-r ${method.color} 
                  ${method.hoverColor} transform transition-all duration-300
                  hover:scale-105 hover:shadow-2xl
                  ${isSelected ? 'scale-105 shadow-2xl ring-2 ring-white/50' : ''}
                  ${isAnimating && !isSelected ? 'opacity-50' : ''}
                  disabled:cursor-not-allowed
                `}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                               transition-transform duration-700" />
                
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <IconComponent size={32} className="text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {method.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {method.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white/90 text-sm font-medium">Get Started</span>
                    <ArrowRight size={16} className="text-white/90" />
                  </div>
                </div>

                {/* Loading indicator for selected method */}
                {isSelected && isAnimating && (
                  <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick add option */}
        <div className="border-t border-white/20 pt-6">
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm">Or quickly add by title</p>
          </div>
          
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={bookTitle}
              onChange={e => setBookTitle(e.target.value)}
              placeholder="Enter book title..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 
                         focus:ring-white/30 focus:border-transparent transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              onClick={handleAdd}
              disabled={!bookTitle.trim()}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         border border-white/20 rounded-lg text-white font-medium
                         transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add