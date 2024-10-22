import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: JSON.parse(localStorage.getItem("posts")) || [],
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
