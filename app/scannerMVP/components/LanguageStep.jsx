import React from 'react';
import useBookScannerStore from '../stores/useBookScannerStore';

const LanguageStep = () => {
  const { bookData, updateBookData } = useBookScannerStore();

  const popularLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' }
  ];

  const allLanguages = [
    { code: 'af', name: 'Afrikaans' },
    { code: 'sq', name: 'Albanian' },
    { code: 'am', name: 'Amharic' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hy', name: 'Armenian' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'eu', name: 'Basque' },
    { code: 'be', name: 'Belarusian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'ceb', name: 'Cebuano' },
    { code: 'zh', name: 'Chinese' },
    { code: 'co', name: 'Corsican' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'et', name: 'Estonian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'fy', name: 'Frisian' },
    { code: 'gl', name: 'Galician' },
    { code: 'ka', name: 'Georgian' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'ha', name: 'Hausa' },
    { code: 'haw', name: 'Hawaiian' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hmn', name: 'Hmong' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'ig', name: 'Igbo' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ga', name: 'Irish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'jv', name: 'Javanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Khmer' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'ko', name: 'Korean' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'ky', name: 'Kyrgyz' },
    { code: 'lo', name: 'Lao' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lb', name: 'Luxembourgish' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ms', name: 'Malay' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mt', name: 'Maltese' },
    { code: 'mi', name: 'Maori' },
    { code: 'mr', name: 'Marathi' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'my', name: 'Myanmar (Burmese)' },
    { code: 'ne', name: 'Nepali' },
    { code: 'no', name: 'Norwegian' },
    { code: 'ny', name: 'Nyanja (Chichewa)' },
    { code: 'or', name: 'Odia (Oriya)' },
    { code: 'ps', name: 'Pashto' },
    { code: 'fa', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sm', name: 'Samoan' },
    { code: 'gd', name: 'Scots Gaelic' },
    { code: 'sr', name: 'Serbian' },
    { code: 'st', name: 'Sesotho' },
    { code: 'sn', name: 'Shona' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'si', name: 'Sinhala (Sinhalese)' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'so', name: 'Somali' },
    { code: 'es', name: 'Spanish' },
    { code: 'su', name: 'Sundanese' },
    { code: 'sw', name: 'Swahili' },
    { code: 'sv', name: 'Swedish' },
    { code: 'tl', name: 'Tagalog (Filipino)' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ta', name: 'Tamil' },
    { code: 'tt', name: 'Tatar' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'tk', name: 'Turkmen' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ur', name: 'Urdu' },
    { code: 'ug', name: 'Uyghur' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'cy', name: 'Welsh' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yi', name: 'Yiddish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'zu', name: 'Zulu' }
  ];

  const handleLanguageSelect = (languageCode) => {
    updateBookData('language', languageCode);
  };

  const getLanguageName = (code) => {
    const lang = allLanguages.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">🌍 Book Language</h2>
        <p className="text-white/80">What language is your book written in?</p>
      </div>

      {/* Popular languages grid */}
      <div className="mb-8">
        <h3 className="text-white font-medium mb-4">📚 Popular Languages</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {popularLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`p-4 rounded-lg border transition-all text-left ${
                bookData.language === language.code
                  ? 'bg-blue-500/50 border-blue-400 text-white'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm opacity-70">{language.native}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* All languages dropdown */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3">🔍 All Languages</h3>
        <select
          value={bookData.language}
          onChange={(e) => handleLanguageSelect(e.target.value)}
          className="w-full p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
        >
          <option value="" className="bg-gray-800">Select a language...</option>
          {allLanguages.map((language) => (
            <option key={language.code} value={language.code} className="bg-gray-800">
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {/* Language detection hint */}
      {bookData.title && (
        <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <h4 className="text-purple-200 font-medium mb-2">🤖 Auto-Detection</h4>
          <p className="text-purple-200 text-sm mb-3">
            Based on your book title "<strong>{bookData.title}</strong>", we detected:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded text-purple-200 text-sm hover:bg-purple-600/50 transition-colors"
            >
              🇺🇸 English (Auto-detected)
            </button>
          </div>
        </div>
      )}

      {/* Selected language display */}
      {bookData.language && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {popularLanguages.find(l => l.code === bookData.language)?.flag || '🌍'}
            </span>
            <div>
              <p className="text-green-200 font-medium">
                ✅ Language Selected: {getLanguageName(bookData.language)}
              </p>
              {popularLanguages.find(l => l.code === bookData.language)?.native && (
                <p className="text-green-300/80 text-sm">
                  Native name: {popularLanguages.find(l => l.code === bookData.language).native}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Language stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-blue-300">100+</div>
          <div className="text-blue-200 text-sm">Languages</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-green-300">🤖</div>
          <div className="text-green-200 text-sm">Auto-Detect</div>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-purple-300">📚</div>
          <div className="text-purple-200 text-sm">Multi-Lingual</div>
        </div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl text-orange-300">🌍</div>
          <div className="text-orange-200 text-sm">Global</div>
        </div>
      </div>

      {/* Current book info */}
      {bookData.title && bookData.author && (
        <div className="mb-6 p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
          <p className="text-gray-200 text-sm">
            📖 <strong>"{bookData.title}"</strong> by {bookData.author}
            {bookData.language && ` - Language: ${getLanguageName(bookData.language)}`}
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tips:</strong> Language helps with search and organization. For bilingual books, choose the primary language. We support 100+ languages!
        </p>
      </div>
    </div>
  );
};

export default LanguageStep;