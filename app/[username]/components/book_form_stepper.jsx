import React, { useState } from 'react';
import { Upload, Check, Plus, Link, X } from 'lucide-react';
import { useBooksStore } from '../../../stores/useBooksStore'
import { useMenuStore } from '../../../stores/useMenuStore'


export default function BookForm() {
  const addBook = useBooksStore((s) => s.addBook);
  const { toggleAdd } = useMenuStore();
  const addState = useMenuStore((s) => s.add);

  // Debug logging
  console.log('BookForm render - addState:', addState);

  const [currentStep, setCurrentStep] = useState(0);
  const [coverPreview, setCoverPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    isbn: '',
    size: '',
    format: '',
    language: 'English',
    coverImage: null,
    notes: ''
  });

  const steps = [
    { id: 0, name: 'Scan' },
    { id: 1, name: 'Info' },
    { id: 2, name: 'Category' },
    { id: 3, name: 'Review' }
  ];

  const categories = {
    'Arts & Humanities': ['Literature & Poetry', 'Philosophy', 'Religion & Spirituality', 'History & Culture', 'Languages'],
    'Social Sciences': ['Psychology', 'Sociology', 'Anthropology', 'Political Science', 'Economics & Business', 'Education'],
    'Science & Technology': ['Natural Sciences', 'Mathematics', 'Computer Science & AI', 'Engineering & Architecture', 'Medicine & Health'],
    'Practical Life': ['Self-Improvement', 'Motivation & Habits', 'Relationships', 'Career & Productivity', 'Lifestyle'],
    'Biographies': ['Historical Figures', 'Celebrities', 'Activists & Leaders', 'Memoirs'],
    'Arts & Creativity': ['Visual Arts', 'Music', 'Theater & Film', 'Design & Architecture', 'Creative Process'],
    'Fiction': ['Fantasy', 'Sci-Fi', 'Mystery', 'Thriller', 'Romance', 'Classics', 'Short Stories', 'Children\'s & YA']
  };

  const popularTags = [
    'Bestseller', 'Award Winner', 'Classic', 'Contemporary', 'Educational',
    'Inspirational', 'Reference', 'Research', 'Textbook', 'Popular Science'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const canProceed = () => {
    switch(currentStep) {
      case 0: return coverPreview !== null;
      case 1: return formData.title.trim() !== '';
      case 2: return selectedCategory !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAdd = () => {
    if (!formData.title.trim()) return;
    
    const newBook = {
      id: Date.now().toString(),
      title: formData.title,
      author: formData.author,
      year: formData.year,
      isbn: formData.isbn,
      size: formData.size,
      format: formData.format,
      language: formData.language,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      tags: selectedTags,
      rating: rating,
      notes: formData.notes,
      position: { x: 0.1, y: 0.1, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { "width": 0.3, "height": 0.44, "thickness": 0.07 },
      cover: { 
        front: coverPreview || "./books/learningweb.webp" 
      },
      dateAdded: new Date().toISOString()
    };
    
    addBook(newBook);
    
    // Reset form after successful addition
    setFormData({
      title: '',
      author: '',
      year: '',
      isbn: '',
      size: '',
      format: '',
      language: 'English',
      coverImage: null,
      notes: ''
    });
    setCoverPreview(null);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedTags([]);
    setRating(0);
    setCurrentStep(0);
  };

  const handleSubmit = () => {
    handleAdd();
    // alert('Book added successfully!');
    // setAdd(false);
    toggleAdd();
  };

  return (
    <div className="absolute w-screen top-0 left-0 z-50 h-screen flex items-center justify-center p-4 ">
      <div className="w-full max-w-2xl">
        {/* Overlay */}

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked'); // Debug log
            toggleAdd();
          }}
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium shadow-sm transition-all"
        >
          ✕ Close
        </button>
       

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Step 0: Scan Book */}
          {currentStep === 0 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Scan Book</h2>

              {/* Main Scan Button */}
              <button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-12 transition-all mb-6 group">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Scan Book Cover</p>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-3 text-gray-400 text-xs">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Alternative Options */}
              <div className="grid grid-cols-2 gap-2">
                <label className="block cursor-pointer group">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all text-center">
                    <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                    <p className="text-gray-700 text-xs font-medium">Upload</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all text-center group">
                  <Link className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-gray-700 text-xs font-medium">URL</p>
                </button>
              </div>

              {/* Preview */}
              {coverPreview && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-gray-900 text-sm flex-1">Cover uploaded</p>
                    <Check className="text-gray-900" size={18} />
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    canProceed()
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Book Info */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Book Info</h2>

              <div className="space-y-4">
                {/* Primary Info */}
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Author"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  />
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="Year"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  />
                </div>

                {/* Divider */}
                <div className="py-2"></div>

                {/* Secondary Info */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="ISBN"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  />
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="Size"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                  >
                    <option value="">Format</option>
                    <option value="hardcover">Hardcover</option>
                    <option value="paperback">Paperback</option>
                    <option value="ebook">E-book</option>
                  </select>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Danish">Danish</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    canProceed()
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Category & Tags */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Category & Tags</h2>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-all"
                >
                  <option value="">Select category</option>
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              {selectedCategory && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    {categories[selectedCategory].map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSubcategory === sub
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= rating ? 'text-gray-900 fill-current' : 'text-gray-300'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={star <= rating ? 0 : 2}
                          fill={star <= rating ? 'currentColor' : 'none'}
                          // d="M131.4 108.6c-5.5 17.5-21.6 27.5-44.3 27.5q-0.6 0-1.3 0l-59.5-1.2c-3.2 0-5.7-2.7-5.7-5.9v-3.6c0-15.5 0.1-75.9 0.1-83.3 0-11.4 5.5-20.8 15.5-26.5 11.9-6.7 28.3-6.8 39-0.4 8.5 5.1 13.3 13.3 13.6 23 0.2 5.3-1 10.9-3.4 16.3 10.9-1.6 21.6 0.9 31.1 7.3 13.7 9.2 20.3 29.7 14.9 46.8zm-54.3-70c-0.2-5.8-2.9-10.2-7.9-13.3-7.3-4.3-18.9-4.1-27.2 0.6-4.3 2.4-9.5 7.2-9.5 16.2 0 6.9-0.1 60.6-0.2 80v1.2l53.7 1.1q0.6 0 1.2 0c17.4 0 29.1-6.9 33-19.3 3.8-12.2-0.8-27.2-10.3-33.6-18-12-35.2-1.5-38.5 0.7q-0.4 0.2-0.8 0.5c-2.6 1.9-6.2 1.3-8.1-1.3-1.9-2.6-1.3-6.2 1.2-8.2q0.1-0.1 0.9-0.6c7.5-5.5 12.8-15.6 12.5-24z"
                          
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags (optional)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    placeholder="Add custom tag..."
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  />
                  <button
                    onClick={addCustomTag}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <Plus size={16} className="text-gray-600" />
                  </button>
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="hover:bg-gray-800 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    canProceed()
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Review</h2>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex items-start space-x-4 mb-6">
                  {coverPreview ? (
                    <div className="w-20 h-28 rounded overflow-hidden flex-shrink-0 shadow">
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-28 bg-gray-200 rounded flex-shrink-0"></div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{formData.title || 'Untitled'}</h3>
                    {formData.author && <p className="text-gray-600">{formData.author}</p>}
                    {formData.year && <p className="text-gray-500 text-sm">{formData.year}</p>}
                    {rating > 0 && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= rating ? 'text-gray-900 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                  {formData.isbn && <div className="flex"><span className="text-gray-500 w-24">ISBN:</span><span className="text-gray-900">{formData.isbn}</span></div>}
                  {formData.size && <div className="flex"><span className="text-gray-500 w-24">Size:</span><span className="text-gray-900">{formData.size}</span></div>}
                  {formData.format && <div className="flex"><span className="text-gray-500 w-24">Format:</span><span className="text-gray-900">{formData.format}</span></div>}
                  {formData.language && <div className="flex"><span className="text-gray-500 w-24">Language:</span><span className="text-gray-900">{formData.language}</span></div>}
                  {selectedCategory && <div className="flex"><span className="text-gray-500 w-24">Category:</span><span className="text-gray-900">{selectedCategory}</span></div>}
                  {selectedSubcategory && <div className="flex"><span className="text-gray-500 w-24">Subcategory:</span><span className="text-gray-900">{selectedSubcategory}</span></div>}
                </div>

                {selectedTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add thoughts or favorite quotes..."
                  rows="4"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-all resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all"
                >
                  Add Book
                </button>
              </div>
            </div>
          )}
        </div>
        <div class="cover">
<div class="back">
</div>
<div class="spine">
</div>
<div class="front">
</div>
</div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-12 space-x-2 bg-balck/50 rounded-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center transition-all ${index === currentStep ? 'scale-110' : ''}`}>
                <div className={`w-fit h-8 px-2 rounded-[4px] flex items-center justify-center text-sm font-medium transition-all ${
                  index < currentStep 
                    ? 'bg-gray-200 text-white' 
                    : index === currentStep 
                    ? 'bg-gray-300 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                   <span className={`text-xs ${index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {step.name}
                </span>

                  {index < currentStep && '✓' }
                  {/* {index < currentStep ? '✓' : index + 1} */}
                </div>
                {/* <span className={`text-xs mt-1 ${index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {step.name}
                </span> */}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px ${
                  index < currentStep ? 'bg-gray-900' : 'bg-gray-400'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}