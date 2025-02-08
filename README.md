# NextGen Thinkers - Modern Blogging Platform

A feature-rich blogging platform built with React, Appwrite, and Redux that allows users to create, manage, and share content with a modern user interface.

## 🌟 Features

### Authentication & User Management
- 🔐 Secure email/password authentication
- 👤 User profile management
- 📝 Custom user profiles with bio, social links, and profile picture
- 🔄 Session management

### Content Management
- ✍️ Create, edit, and delete blog posts
- 📸 Image upload support for posts
- 🏷️ Post status management (active/inactive)
- 💾 Draft saving functionality
- 📱 Responsive design for all devices

### Social Features
- 💫 Follow/Unfollow users
- 🔖 Save posts for later
- 👥 User connections
- 📊 Post analytics

### Rich Text Editor
- 📝 TinyMCE integration
- 🖼️ Image embedding
- 🎨 Text formatting options
- 📋 Copy/paste support

## 🛠️ Technology Stack

- **Frontend**: React.js
- **State Management**: Redux
- **Backend as a Service**: Appwrite
- **Styling**: TailwindCSS
- **Form Management**: React Hook Form
- **Rich Text Editor**: TinyMCE
- **Routing**: React Router v6
- **Notifications**: React Toastify

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm/yarn
- Appwrite instance

### Environment Variables
Create a `.env` file in the root directory with the following variables:

env
VITE_APPWRITE_URL=your_appwrite_url
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/nextgen-thinkers.git
```

2. Install dependencies
```bash
cd nextgen-thinkers
npm install
```

3. Start the development server
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── appwrite/          # Appwrite service configurations
├── components/        # Reusable React components
├── pages/            # Page components
├── store/            # Redux store configuration
├── conf/             # Configuration files
└── assets/           # Static assets
```

## 🔑 Key Components

- `AuthLayout`: Handles authentication routing
- `PostForm`: Manages post creation/editing
- `UserProfileCard`: Displays user profile information
- `Header`: Navigation and user menu
- `RTE`: Rich text editor implementation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Appwrite](https://appwrite.io/) for backend services
- [TailwindCSS](https://tailwindcss.com/) for styling
- [TinyMCE](https://www.tiny.cloud/) for rich text editing
- All contributors who have helped this project grow

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/nextgen-thinkers](https://github.com/yourusername/nextgen-thinkers)


This README provides a comprehensive overview of your project, including:

- Features and capabilities
























import React, { useState } from "react";
import Cookies from "js-cookie";

function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage("Title and content are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (media) {
      formData.append("media", media);
    }

    try {
      setLoading(true);
      setMessage("");

      // Retrieve the access token from cookies
      // const token = Cookies.get("accessToken");
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "http://localhost:3000/api/v1/content/posts/",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessage("Post created successfully!");
        setTitle("");
        setContent("");
        setMedia(null);
      } else {
        setMessage(result.message || "Something went wrong!");
      }
    } catch (error) {
      setMessage("Error creating post!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Create a New Post
        </h2>

        {message && <p className="text-sm mb-4 text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Title</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="Enter title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Content</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-indigo-300"
              placeholder="Enter content..."
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">
              Upload Media
            </label>
            <input
              type="file"
              className="w-full mt-1 p-2 border rounded-lg"
              accept="image/*,video/*"
              onChange={(e) => setMedia(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded-lg font-medium hover:bg-indigo-700 transition"
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
