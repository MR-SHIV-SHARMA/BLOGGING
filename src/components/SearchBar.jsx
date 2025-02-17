import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSearch, FaTimes, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

// Dropdown to display search results.
const SearchResultDropdown = ({ results, onClose, userAvatars }) => {
  const isUserSearch =
    results.searchEntry && results.searchEntry.query.startsWith("@");

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
                  target="_blank"
                  rel="noopener noreferrer"
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
                    {/* <div className="text-xs text-gray-500">
                      ID: {item.userId || item._id}
                    </div> */}
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
  // State to store avatars fetched separately
  const [userAvatars, setUserAvatars] = useState({});

  const navigate = useNavigate();

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

      // If it's a user search (query starts with "@"), display dropdown
      if (searchQuery.trim().startsWith("@")) {
        setSearchResults(response.data);
      } else {
        // For non-user searches, navigate to the dedicated search results page.
        setSearchResults(null);
        navigate("/search-results", { state: { data: response.data } });
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(null);
    }
  };

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

      const token = localStorage.getItem("accessToken");
      const newUserIds = results.map((item) => item.userId || item._id);
      const uniqueUserIds = [...new Set(newUserIds)];

      for (let id of uniqueUserIds) {
        if (!id) continue;
        console.log("Fetching avatar for id: " + id);
        try {
          const response = await axios.get(
            `https://bg-io.vercel.app/api/v1/user/profile/view/${id}`,
            {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }
          );

          if (response.data && response.data.data.avatar) {
            setUserAvatars((prev) => ({
              ...prev,
              [id]: response.data.data.avatar,
            }));
          }

          console.log("User avatar:", response.data.data.avatar);
        } catch (err) {
          console.error(`Error fetching avatar for user ${id}:`, err);
        }
      }
    }

    fetchAvatars();
  }, [searchResults]);

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
          />
        )
      )}
    </div>
  );
};

export default SearchBar;
