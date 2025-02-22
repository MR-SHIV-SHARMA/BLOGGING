import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { FaTrash, FaSearch, FaTimes, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// -----------------------------------------------------
// SearchBar Component
// -----------------------------------------------------
const SearchBar = () => {
  // States & Refs
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Utility function to close the search bar completely.
  const closeSearchBar = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchHistory(null);
    setShowSearch(false);
  };

  // API / Helper Functions
  const performSearch = async (query) => {
    if (!query.trim()) return;
    const token = Cookies.get("accessToken");
    try {
      const response = await axios.post(
        "/common/search/search-history/",
        { query },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );
      if (query.trim().startsWith("@")) {
        setSearchResults(response.data);
      } else {
        setSearchResults(null);
        navigate("/search-results", { state: { data: response.data } });
      }
    } catch (error) {}
  };

  const fetchSearchHistory = async () => {
    const token = Cookies.get("accessToken");
    try {
      const response = await axios.get("/common/search/search-history/", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        withCredentials: true,
      });
      setSearchHistory(response.data);
    } catch (error) {
      setSearchHistory(null);
    }
  };

  const deleteSearchHistoryEntry = async (id) => {
    const token = Cookies.get("accessToken");
    try {
      await axios.delete(`/common/search/search-history/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        withCredentials: true,
      });
      setSearchHistory((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          results: prev.data.results.filter((item) => item._id !== id),
        },
      }));
    } catch (error) {}
  };

  const clearSearchHistory = async () => {
    const token = Cookies.get("accessToken");
    try {
      await axios.delete("/common/search/search-history/clear", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        withCredentials: true,
      });
      setSearchHistory((prev) =>
        prev
          ? { ...prev, data: { ...prev.data, results: [], suggestions: [] } }
          : prev
      );
    } catch (error) {}
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await performSearch(searchQuery);
    // If it's a non-user search (so we navigated to /search-results), close the search bar.
    if (!searchQuery.trim().startsWith("@")) {
      closeSearchBar();
    }
  };

  const handleHistorySelect = async (query) => {
    setSearchQuery(query);
    await performSearch(query);
    // For non-user search history selection, close the search bar
    if (!query.trim().startsWith("@")) {
      closeSearchBar();
    }
  };

  // useEffect Hooks
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only add the "click outside" listener on non-mobile devices.
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (!showSearch) {
      setSearchQuery("");
      setSearchResults(null);
      setSearchHistory(null);
    }
  }, [showSearch]);

  useEffect(() => {
    async function fetchAvatars() {
      if (
        !searchResults ||
        !searchResults.data ||
        !searchResults.data.results ||
        !Array.isArray(searchResults.data.results)
      )
        return;
      const { searchEntry, results } = searchResults.data;
      if (!searchEntry || !searchEntry.query.startsWith("@")) return;
      const token = Cookies.get("accessToken");
      const newUserIds = results.map((item) => item.userId || item._id);
      const uniqueUserIds = [...new Set(newUserIds)];
      for (let id of uniqueUserIds) {
        if (!id) continue;
        try {
          const response = await axios.get(`/user/profile/view/${id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          });
          if (response.data && response.data.data.avatar) {
            setUserAvatars((prev) => ({
              ...prev,
              [id]: response.data.data.avatar,
            }));
          }
        } catch (err) {}
      }
    }
    fetchAvatars();
  }, [searchResults]);

  // Render Blocks
  const mobileOverlay = (
    <div className="fixed top-0 left-0 w-full z-[9999]">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={closeSearchBar}
      />
      <div className="relative mx-auto mt-4 w-64 bg-white p-2 rounded">
        <form onSubmit={handleSearch} className="flex">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (!searchQuery.trim()) fetchSearchHistory();
            }}
            placeholder="Search..."
            className="px-1 border rounded-l-md focus:outline-none w-full"
          />
          <button
            type="button"
            onClick={closeSearchBar}
            aria-label="Close search bar"
            className="px-2 py-1 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition flex items-center"
          >
            <FaSearch size={16} />
          </button>
        </form>
        {searchResults ? (
          <SearchResultDropdown
            results={searchResults.data}
            onClose={() => setSearchResults(null)}
            onResultClick={closeSearchBar}
            userAvatars={userAvatars}
          />
        ) : (
          !searchQuery.trim() &&
          searchHistory && (
            <SearchHistoryDropdown
              history={searchHistory}
              onClose={() => setSearchHistory(null)}
              onDelete={deleteSearchHistoryEntry}
              onClear={clearSearchHistory}
              onSelectHistory={handleHistorySelect}
            />
          )
        )}
      </div>
    </div>
  );

  const desktopDropdown = (
    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-64 bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSearch} className="flex">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (!searchQuery.trim()) fetchSearchHistory();
          }}
          placeholder="Search..."
          className="px-1 border rounded-l-md focus:outline-none w-full"
        />
        <button
          type="button"
          onClick={closeSearchBar}
          aria-label="Close search bar"
          className="px-2 py-1 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition flex items-center"
        >
          <FaSearch size={16} />
        </button>
      </form>
      {searchResults ? (
        <SearchResultDropdown
          results={searchResults.data}
          onClose={() => setSearchResults(null)}
          onResultClick={closeSearchBar}
          userAvatars={userAvatars}
        />
      ) : (
        !searchQuery.trim() &&
        searchHistory && (
          <SearchHistoryDropdown
            history={searchHistory}
            onClose={() => setSearchHistory(null)}
            onDelete={deleteSearchHistoryEntry}
            onClear={clearSearchHistory}
            onSelectHistory={handleHistorySelect}
          />
        )
      )}
    </div>
  );

  // -----------------------------------------------------
  // Final Render
  // -----------------------------------------------------
  return (
    <div className="relative" ref={wrapperRef}>
      {isMobile ? (
        showSearch ? (
          ReactDOM.createPortal(mobileOverlay, document.body)
        ) : (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            aria-label="Open search bar"
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
          >
            <FaSearch size={16} />
          </button>
        )
      ) : (
        <>
          {!showSearch && (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              aria-label="Open search bar"
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
            >
              <FaSearch size={16} />
            </button>
          )}
          {showSearch && desktopDropdown}
        </>
      )}
    </div>
  );
};

// -----------------------------------------------------
// SearchResultDropdown Component
// -----------------------------------------------------
const SearchResultDropdown = ({
  results,
  onClose,
  userAvatars,
  onResultClick,
}) => {
  const isUserSearch =
    results.searchEntry && results.searchEntry.query.startsWith("@");
  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-full md:max-w-lg bg-white shadow-lg rounded-lg border border-gray-200 z-50">
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Search Results</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-red-600 transition"
          aria-label="Close search results"
        >
          <FaTimes size={18} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="font-semibold text-gray-700">Query:</p>
          <p className="text-sm text-gray-600">
            {results.searchEntry ? results.searchEntry.query : ""}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-2">Results:</p>
          {results.results && results.results.length > 0 ? (
            results.results.map((item) =>
              isUserSearch ? (
                <Link
                  key={item._id}
                  to={`/api/v1/user/profile/view/f/${item.userId || item._id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded transition"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                    {item.avatar ||
                    (userAvatars && userAvatars[item.userId || item._id]) ? (
                      <img
                        src={
                          item.avatar || userAvatars[item.userId || item._id]
                        }
                        alt={item.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaUserCircle size={40} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-800 font-bold">
                      {item.fullname}{" "}
                      <span className="text-sm text-gray-500">
                        (@{item.username})
                      </span>
                    </div>
                    {item.bio && (
                      <p className="text-sm text-gray-600">{item.bio}</p>
                    )}
                    {item.createdAt && (
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  key={item._id}
                  className="p-2 hover:bg-gray-100 rounded transition"
                >
                  {item.title
                    ? item.title
                    : item.username
                    ? item.username
                    : "Result"}
                </div>
              )
            )
          ) : (
            <p className="text-sm text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// SearchHistoryDropdown Component
// -----------------------------------------------------
const SearchHistoryDropdown = ({
  history,
  onClose,
  onDelete,
  onClear,
  onSelectHistory,
}) => {
  const results = history.data.results;
  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-full md:max-w-lg bg-white shadow-lg rounded-lg border border-gray-200 z-50">
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Search History</h3>
        <div className="flex space-x-2">
          <button
            onClick={onClear}
            title="Clear All"
            className="text-sm text-red-500 hover:text-red-600 transition"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-red-600 transition"
            aria-label="Close search history"
          >
            <FaTimes size={18} />
          </button>
        </div>
      </div>
      <div className="p-4 max-h-72 overflow-y-auto">
        {results && results.length > 0 ? (
          results.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-2 hover:bg-gray-100 rounded transition mb-1 cursor-pointer"
              onClick={() => onSelectHistory(item.query)}
            >
              <div>
                <span className="font-semibold text-gray-700">
                  {item.query}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item._id);
                }}
                className="p-1 text-gray-500 hover:text-red-600 transition"
                title="Delete this entry"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No search history found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
