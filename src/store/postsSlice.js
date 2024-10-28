import { createSlice } from "@reduxjs/toolkit";

// Function to get posts from localStorage
const getPostsFromLocalStorage = () => {
  const posts = localStorage.getItem("posts");

  // Check if posts is not null or undefined
  if (posts === null || posts === undefined) {
    return []; // Return an empty array if there's no valid entry
  }

  try {
    return JSON.parse(posts); // Attempt to parse the valid JSON
  } catch (error) {
    console.error("Error parsing posts from localStorage:", error);
    return []; // Return an empty array in case of JSON parsing error
  }
};

// Initialize the initial state
const initialState = {
  posts: getPostsFromLocalStorage(),
  savedPosts: JSON.parse(localStorage.getItem("savedPosts")) || [],
};

// Create the posts slice
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
      localStorage.setItem("posts", JSON.stringify(state.posts));
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
      localStorage.setItem("posts", JSON.stringify(state.posts));
    },
    clearPosts: (state) => {
      state.posts = [];
      localStorage.removeItem("posts");
    },
    addSavedPost: (state, action) => {
      // Check if the post is already saved to avoid duplicates
      const exists = state.savedPosts.some(
        (post) => post.$id === action.payload.$id
      );
      if (!exists) {
        state.savedPosts.push(action.payload);
        localStorage.setItem("savedPosts", JSON.stringify(state.savedPosts));
      }
    },
    removeSavedPost: (state, action) => {
      state.savedPosts = state.savedPosts.filter(
        (post) => post.$id !== action.payload
      );
      localStorage.setItem("savedPosts", JSON.stringify(state.savedPosts));
    },
  },
});

// Export actions
export const { setPosts, addPost, clearPosts, addSavedPost, removeSavedPost } =
  postsSlice.actions;

// Export reducer
export default postsSlice.reducer;
