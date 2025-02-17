import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useSearchParams, Link } from "react-router-dom";

function SearchResultsPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Debug: Log the entire location state to inspect what we're receiving from the previous page.
  console.log("Location state:", location.state);

  // If we have data from the navigation state, extract the inner 'data' property.
  const initialData = location.state?.data?.data || null;
  console.log("Initial data from state:", initialData);

  const [searchData, setSearchData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Determine the search query from the state (if available) or by checking URL query params.
  const query =
    location.state?.data?.data?.searchEntry?.query || searchParams.get("query");
  console.log("Determined query:", query);

  // Debug: Log every time searchData updates.
  useEffect(() => {
    console.log("searchData updated:", searchData);
  }, [searchData]);

  useEffect(() => {
    if (!searchData && query) {
      const token = localStorage.getItem("accessToken");
      console.log("Initiating fetch for search results with query:", query);
      console.log("Token found:", token);

      setLoading(true);
      axios
        .post(
          "https://bg-io.vercel.app/api/v1/common/search/search-history/",
          { query },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log("Full API response received:", response);
          if (response && response.data) {
            if (response.data.data) {
              setSearchData(response.data.data);
              if (
                response.data.data.results &&
                response.data.data.results.length > 0
              ) {
                console.log(
                  "Search data (first result title):",
                  response.data.data.results[0].title
                );
              } else {
                console.log(
                  "No results found within response.data.data.results:",
                  response.data.data.results
                );
              }
            } else {
              console.log(
                "No inner data found in response.data:",
                response.data
              );
            }
          } else {
            console.log("Invalid API response format:", response);
          }
        })
        .catch((err) => {
          console.error("Error fetching search results:", err);
          setError("Error fetching search results.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [query, searchData]);

  // NEW: This effect listens to changes in the location.
  // When a new search is performed, the navigate() call in SearchBar updates location.state.
  // We then update searchData accordingly.
  useEffect(() => {
    const newSearchData = location.state?.data?.data;
    if (newSearchData) {
      // If the new search query is different from the current one, update state.
      if (
        !searchData ||
        (newSearchData.searchEntry &&
          newSearchData.searchEntry.query !== searchData.searchEntry?.query)
      ) {
        console.log(
          "Updating search data from new location state:",
          newSearchData
        );
        setSearchData(newSearchData);
        setLoading(false);
        setError(null);
      }
    }
  }, [location.state]); // Runs whenever location.state changes

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading search results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{searchData?.searchEntry?.query || query}"
      </h1>
      {searchData?.results && searchData.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchData.results.map((item) => (
            <Link key={item._id} to={`/post/${item._id}`} className="block">
              <div className="p-4 border border-gray-200 rounded hover:shadow-lg transition duration-200">
                {item.media && (
                  <div className="mb-4">
                    <img
                      src={item.media}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2">
                  {item.title || "Untitled"}
                </h2>
                {item.content && (
                  <p className="text-gray-700 mb-2">
                    {item.content.length > 150
                      ? item.content.substring(0, 150) + "..."
                      : item.content}
                  </p>
                )}
                {item.categories && item.categories.length > 0 && (
                  <div className="mb-2">
                    {item.categories.map((cat) => (
                      <span
                        key={cat._id || cat.name}
                        className="inline-block bg-gray-200 text-gray-700 px-2 py-1 mr-1 rounded text-sm"
                      >
                        {cat.name || "Category"}
                      </span>
                    ))}
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag._id || tag.name}
                        className="inline-block bg-gray-200 text-gray-700 px-2 py-1 mr-1 rounded text-sm"
                      >
                        {tag.name || "Tag"}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-500 text-sm">
                  <span>
                    Created on: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.likes && (
                    <span className="ml-4">Likes: {item.likes.length}</span>
                  )}
                  {item.comments && (
                    <span className="ml-4">
                      Comments: {item.comments.length}
                    </span>
                  )}
                  {item.userId?.username && (
                    <span className="ml-4">
                      Author: {item.userId?.username}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No results found.</p>
      )}
    </div>
  );
}

export default SearchResultsPage;
