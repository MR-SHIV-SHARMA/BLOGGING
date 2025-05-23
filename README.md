# NextGen Thinkers - Social Blogging Platform

A modern, feature-rich social blogging platform built with React that enables users to create, share, and interact with content while maintaining a professional networking environment.

## 🚀 Features

### Authentication & User Management
- Secure user authentication with JWT
- Password reset functionality
- Account restoration
- Profile management with avatar and cover image
- Social media integration

### Content Management
- Create and edit blog posts
- Rich media support
- Category and tag management
- Post reactions (likes, comments)
- Advanced search functionality
- Real-time notifications

### User Interface
- Responsive design for all devices
- Modern, clean UI with Tailwind CSS
- Infinite scroll for content loading
- Dynamic search with instant results
- Interactive notifications system
- Custom scrollbars and animations

### Social Features
- Follow/Unfollow users
- User profiles
- Activity feed
- Social sharing
- Comment system

## 🛠 Technology Stack

- **Frontend Framework**: React
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Fetching**: Axios, React Query
- **UI Components**: 
  - Framer Motion for animations
  - React Icons
  - React Masonry
- **Authentication**: JWT with HTTP-only cookies
- **Notifications**: React Hot Toast, React Toastify
- **Form Handling**: Native React forms

## �� Project Structure
src/
├── api/
│ └── axiosClient.js # Axios configuration and interceptors
├── components/ # React components
├── context/ # React Context providers
├── Routes/ # Route protection components
└── main.jsx # Application entry point

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd nextgen-thinkers
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

4. **Start the development server**
```bash
npm run dev
```

## 🔒 Security Features

- JWT-based authentication
- Protected routes
- Automatic token refresh
- HTTP-only cookies
- Request/Response interceptors
- XSS protection

## 🎨 UI/UX Features

- Responsive design
- Dark/Light mode support
- Loading states
- Error handling
- Toast notifications
- Infinite scrolling
- Custom animations
- Modal dialogs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Initial work - shiv prasad sharma

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who have helped this project grow

