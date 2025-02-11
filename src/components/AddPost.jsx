import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [tagId, setTagId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const categoryResponse = await axios.get(
          "https://bg-io.vercel.app/api/v1/common/categories/manage",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const tagsResponse = await axios.get(
          "https://bg-io.vercel.app/api/v1/content/tags/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
    // Set the tag ID and update the input field with the tag name
    setTagId(tag._id); // Set the selected tag ID
    setTagInput(`#${tag.name}`); // Update the input field with the tag name prefixed by '#'
    setSelectedTags((prevTags) => [...prevTags, tag._id]); // Add tag ID to selected tags
    setFilteredTags([]); // Clear suggestions after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !categoryId) {
      setMessage("Title, content, and category are required!");
      return;
    }

    if (!tagId) {
      setMessage("At least one tag is required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (media) formData.append("media", media);

    const categoriesToSubmit = [categoryId];
    const tagsToSubmit = [tagId];

    formData.append("categoryId", categoriesToSubmit);
    formData.append("tagId", tagsToSubmit);

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setMessage("Authorization token is missing!");
        return;
      }

      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/content/posts",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage("Post created successfully!");
        setTitle("");
        setContent("");
        setMedia(null);
        setCategoryId("");
        setTagId("");
        setTagInput(""); // Clear the tag input after successful submission
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
    <div className="py-8 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-2xl mx-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
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
            className="w-full px-4 py-2.5 border rounded-lg"
          />
          <textarea
            placeholder="Write your post content..."
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-2.5 border rounded-lg"
          />

          <div>
            <select
              className="w-full px-4 py-2.5 border rounded-lg"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search tags (use #)..."
              value={tagInput}
              onChange={handleTagInputChange}
              className="w-full px-4 py-2.5 border rounded-lg"
            />
            <ul className="border rounded-lg mt-2">
              {filteredTags.map((tag) => (
                <li
                  key={tag._id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          </div>

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMedia(e.target.files[0])}
          />

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Posting..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
