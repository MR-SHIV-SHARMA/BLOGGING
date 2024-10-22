import React from "react";
import { Container, PostForm } from "../components/index.js";

function AddPost() {
  return (
    <div className="py-8 bg-gray-200">
      <Container>
        <PostForm />
      </Container>
    </div>
  );
}

export default AddPost;
