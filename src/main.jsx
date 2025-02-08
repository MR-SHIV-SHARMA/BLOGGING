import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Footer from "./components/Footer";
import PostDetail from "./components/Post";
import Header from "./components/Header";
import AllPosts from "./components/AllPosts";
import AddPost from "./components/AddPost";
import UserProfileCard from "./components/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/all-posts" element={<AllPosts />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/user-profile" element={<UserProfileCard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
