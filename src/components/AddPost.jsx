import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa"; // For loading spinner
import Cookies from "js-cookie";

function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // New state to handle post's active status
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("accessToken");

        const categoryResponse = await axios.get("/common/categories/manage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tagsResponse = await axios.get("/content/tags/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tagsResponse.data.success) {
          setTags(tagsResponse.data.data);
        }
        if (categoryResponse.data.success) {
          setCategories(categoryResponse.data.message);
        }
      } catch (error) {
        console.error("Error fetching categories and tags:", error);
      }
    };
    fetchData();
  }, []);

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.startsWith("#")) {
      const searchTerm = value.slice(1).toLowerCase();
      const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm)
      );
      setFilteredTags(filteredTags);
    } else {
      setFilteredTags([]);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) => [...prevTags, tag._id]);
    setTagInput("");
    setFilteredTags([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !categoryId || selectedTags.length === 0) {
      setMessage(
        "Title, content, category, and at least one tag are required!"
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (media) formData.append("media", media);
    formData.append("categoryId", categoryId);
    selectedTags.forEach((tagId) => formData.append("tagId", tagId));

    // Append the isactive field
    formData.append("isactive", isActive ? "true" : "false");

    try {
      setLoading(true);
      setMessage("");
      const token = Cookies.get("accessToken");

      if (!token) {
        setMessage("Authorization token is missing!");
        return;
      }

      const response = await axios.post("/content/posts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage("Post created successfully!");
        setTitle("");
        setContent("");
        setMedia(null);
        setCategoryId("");
        setSelectedTags([]);
        setTagInput("");
      } else {
        setMessage(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setMessage("Error creating post!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          Create a New Post
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <textarea
            placeholder="Write your post content..."
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search tags (use #)..."
              value={tagInput}
              onChange={handleTagInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            {filteredTags.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                {filteredTags.map((tag) => (
                  <li
                    key={tag._id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t._id === tagId);
              return (
                <span
                  key={tagId}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag?.name}
                </span>
              );
            })}
          </div>

          {/* New isactive checkbox field */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isactive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isactive" className="text-sm">
              Active
            </label>
          </div>

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMedia(e.target.files[0])}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                Posting...
              </div>
            ) : (
              "Create Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
