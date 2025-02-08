import React, { useEffect } from "react";
import { Container, PostForm } from "../components/index.js";
import appwriteService from "../appwrite/config.js";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function EditPost() {
  const [post, setPost] = React.useState([]);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate]);
  return post ? (
    <div className="py-8 bg-gray-100">
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  ) : null;
}

export default EditPost;
