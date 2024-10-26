import { createSlice } from "@reduxjs/toolkit";

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

const initialState = {
  posts: getPostsFromLocalStorage(),
};

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
  },
});

export const { setPosts, addPost, clearPosts } = postsSlice.actions;

export default postsSlice.reducer;
