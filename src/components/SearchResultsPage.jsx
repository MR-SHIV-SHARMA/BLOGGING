import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useSearchParams, Link } from "react-router-dom";

function SearchResultsPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract initial data from the location state (if available)
  const initialData = location.state?.data?.data || null;
  const [searchData, setSearchData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Determine the query from either the location state or URL query parameter
  const query =
    location.state?.data?.data?.searchEntry?.query || searchParams.get("query");

  // Fetch search results if there's no search data and a query exists
  useEffect(() => {
    if (!searchData && query) {
      const token = localStorage.getItem("accessToken");
      setLoading(true);
      axios
        .post(
          "http://localhost:3000/api/v1/common/search/search-history/",
          { query },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response?.data?.data) {
            setSearchData(response.data.data);
          }
        })
        .catch((err) => {
          setError("Error fetching search results.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [query, searchData]);

  // Listen to location state changes to update new search results dynamically
  useEffect(() => {
    const newSearchData = location.state?.data?.data;
    if (newSearchData) {
      if (
        !searchData ||
        (newSearchData.searchEntry &&
          newSearchData.searchEntry.query !== searchData.searchEntry?.query)
      ) {
        setSearchData(newSearchData);
        setLoading(false);
        setError(null);
      }
    }
  }, [location.state]);

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
