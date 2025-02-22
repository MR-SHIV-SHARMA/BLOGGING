import React, { useState } from "react";
import { Link } from "react-router-dom";

function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState("account");
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = {
    account: [
      {
        title: "Account Deactivated",
        description:
          "If your account has been deactivated, you can request reactivation by following these steps:",
        steps: [
          'Click on the "Request Account Restoration" button below',
          "Enter your registered email address",
          "Submit the form and wait for our response",
          "Our team will review your request within 24-48 hours",
        ],
        contact: "For urgent assistance, call us at: +1-XXX-XXX-XXXX",
        action: (
          <Link
            to="/account-restoration-request"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Request Account Restoration
          </Link>
        ),
      },
      {
        title: "Password Reset",
        description: "Forgot your password? Here's how to reset it:",
        steps: [
          'Click on "Forgot Password" on the login page',
          "Enter your registered email",
          "Check your email for reset instructions",
          "Follow the link to create a new password",
        ],
      },
    ],
    content: [
      {
        title: "Post Guidelines",
        description:
          "Learn about our content posting guidelines and best practices.",
        steps: [
          "Ensure content is original",
          "Follow community guidelines",
          "Use appropriate tags",
          "Avoid plagiarism",
        ],
      },
    ],
    technical: [
      {
        title: "Common Technical Issues",
        description: "Solutions for frequently encountered technical problems.",
        steps: [
          "Clear browser cache",
          "Update your browser",
          "Check internet connection",
          "Disable browser extensions",
        ],
      },
    ],
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filterHelpItems = () => {
    if (!searchQuery) return helpCategories[selectedCategory];

    return helpCategories[selectedCategory].filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Help Center
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedCategory("account")}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === "account"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Account Help
          </button>
          <button
            onClick={() => setSelectedCategory("content")}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === "content"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Content Guidelines
          </button>
          <button
            onClick={() => setSelectedCategory("technical")}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === "technical"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Technical Support
          </button>
        </div>

        {/* Help Content */}
        <div className="space-y-6">
          {filterHelpItems().map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {item.title}
              </h2>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {item.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ul>
              {item.contact && (
                <p className="mt-4 text-blue-600 font-medium">{item.contact}</p>
              )}
              {item.action && <div className="mt-4">{item.action}</div>}
            </div>
          ))}
        </div>

        {/* Contact Support Button */}
        <div className="mt-8 text-center">
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
