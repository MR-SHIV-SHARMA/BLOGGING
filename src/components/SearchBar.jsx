import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";

// Dropdown to display search results.
const SearchResultDropdown = ({ results, onClose }) => {
  const isUserSearch = results.searchEntry.query.startsWith("@");

  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-lg bg-white shadow-lg rounded-lg border border-gray-200 z-50">
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
          <p className="text-sm text-gray-600">{results.searchEntry.query}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-2">Results:</p>
          {results.results && results.results.length > 0 ? (
            results.results.map((item) =>
              isUserSearch ? (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded transition"
                >
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
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
                </div>
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

// Dropdown to display search history with options to delete individual entries or clear all.
const SearchHistoryDropdown = ({ history, onClose, onDelete, onClear }) => {
  const results = history.data.results;

  return (
    <div className="absolute top-full left-0 mt-2 w-full max-w-lg bg-white shadow-lg rounded-lg border border-gray-200 z-50">
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
              className="flex justify-between items-center p-2 hover:bg-gray-100 rounded transition mb-1"
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
                onClick={() => onDelete(item._id)}
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

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState(null);

  // Handle the search submission (POST method)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/common/search/search-history/",
        { query: searchQuery },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );
      console.log("Search response:", response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(null);
    }
  };

  // Fetch search history using GET method.
  const fetchSearchHistory = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(
        "https://bg-io.vercel.app/api/v1/common/search/search-history/",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );
      console.log("Search history response:", response.data);
      setSearchHistory(response.data);
    } catch (error) {
      console.error("Error fetching search history:", error);
      setSearchHistory(null);
    }
  };

  // Delete a specific search history entry.
  const deleteSearchHistoryEntry = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(
        `https://bg-io.vercel.app/api/v1/common/search/search-history/${id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );
      setSearchHistory((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          results: prev.data.results.filter((item) => item._id !== id),
        },
      }));
    } catch (error) {
      console.error("Error deleting search history entry", error);
    }
  };

  // Clear all search history entries.
  const clearSearchHistory = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(
        "https://bg-io.vercel.app/api/v1/common/search/search-history/clear",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );
      setSearchHistory((prev) =>
        prev
          ? { ...prev, data: { ...prev.data, results: [], suggestions: [] } }
          : prev
      );
    } catch (error) {
      console.error("Error clearing all search history", error);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (!searchQuery.trim()) {
              fetchSearchHistory();
            }
          }}
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition flex items-center"
          aria-label="Search"
        >
          <FaSearch size={16} />
        </button>
      </form>

      {searchResults ? (
        <SearchResultDropdown
          results={searchResults.data}
          onClose={() => setSearchResults(null)}
        />
      ) : (
        !searchQuery.trim() &&
        searchHistory && (
          <SearchHistoryDropdown
            history={searchHistory}
            onClose={() => setSearchHistory(null)}
            onDelete={deleteSearchHistoryEntry}
            onClear={clearSearchHistory}
          />
        )
      )}
    </div>
  );
};

export default SearchBar;
