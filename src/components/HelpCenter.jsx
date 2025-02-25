import React, { useState } from "react";
import {
  FiSearch,
  FiUser,
  FiFileText,
  FiSettings,
  FiArrowUpRight,
  FiSmartphone,
  FiLock,
  FiMail,
  FiPhone,
  FiClock,
  FiAlertCircle,
  FiDatabase,
  FiVideo,
  FiShield,
} from "react-icons/fi";
import { Link } from "react-router-dom";

function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState("account");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);

  const helpCategories = {
    account: [
      {
        title: "Account Deactivation",
        icon: <FiUser className="w-6 h-6" />,
        content: {
          description:
            "If your account has been deactivated, follow these steps to request reactivation:",
          steps: [
            'Click "Request Restoration" below',
            "Verify your email address",
            <Link
              to="/account-restoration-request"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Request Account Restoration
            </Link>,
            "Complete identity verification",
            "Wait for review (24-48 hours)",
          ],
          prevention: [
            "Regularly update your password",
            "Follow community guidelines",
            "Enable 2FA for security",
          ],
          contact: {
            phone: "+1-800-555-1234",
            email: "support@accounthelp.com",
            hours: "24/7 Support Available",
          },
        },
      },
      {
        title: "Password Recovery",
        icon: <FiLock className="w-6 h-6" />,
        content: {
          description: "Securely recover your account password:",
          steps: [
            "Visit the password reset page",
            "Enter your registered email",
            "Check your spam folder for reset link",
            "Create a new strong password",
          ],
          tips: [
            "Use a password manager",
            "Avoid common phrases",
            "Change passwords every 90 days",
          ],
          contact: {
            email: "security@helpcenter.com",
            responseTime: "1-2 business hours",
          },
        },
      },
      {
        title: "Two-Factor Setup",
        icon: <FiShield className="w-6 h-6" />,
        content: {
          description: "Enhance security with 2FA:",
          steps: [
            "Go to Security Settings",
            "Choose authentication method",
            "Verify with SMS or authenticator app",
            "Store backup codes securely",
          ],
          methods: {
            SMS: "Supported in all regions",
            Authenticator: "Google/Microsoft Authenticator",
            Backup: "10 one-time use codes",
          },
        },
      },
      {
        title: "Profile Customization",
        icon: <FiUser className="w-6 h-6" />,
        content: {
          description: "Personalize your profile settings:",
          options: [
            "Avatar upload guidelines",
            "Bio character limits",
            "Social media links",
            "Theme customization",
          ],
          limitations: {
            Avatar: "2MB max size (JPG/PNG)",
            Bio: "500 characters max",
            Links: "3 external links allowed",
          },
        },
      },
      {
        title: "Privacy Settings",
        icon: <FiLock className="w-6 h-6" />,
        content: {
          description: "Manage your account privacy:",
          settings: [
            "Profile visibility",
            "Data sharing preferences",
            "Third-party app access",
            "Activity tracking controls",
          ],
          recommendations: [
            "Review privacy settings monthly",
            "Limit third-party access",
            "Enable activity alerts",
          ],
        },
      },
      {
        title: "Delete Account",
        icon: <FiAlertCircle className="w-6 h-6" />,
        content: {
          description: "Permanently delete your account:",
          warnings: [
            "This action is irreversible",
            "All data will be erased",
            "Subscriptions will cancel",
          ],
          steps: [
            "Go to Account Settings",
            "Request deletion",
            "Confirm via email",
            "7-day cancellation window",
          ],
          contact: {
            email: "deletion@helpcenter.com",
            phone: "+1-800-555-6789",
          },
        },
      },
    ],
    content: [
      {
        title: "Content Moderation",
        icon: <FiFileText className="w-6 h-6" />,
        content: {
          description: "Understanding our content moderation policies:",
          guidelines: [
            "No hate speech or harassment",
            "Respect copyright laws",
            "No explicit content",
            "Authentic engagement only",
          ],
          appealProcess: {
            steps: [
              "Submit appeal within 30 days",
              "Provide supporting evidence",
              "Wait 72 hours for review",
            ],
            successRate: "85% of appeals reviewed within 3 business days",
          },
        },
      },
      {
        title: "Copyright Issues",
        icon: <FiFileText className="w-6 h-6" />,
        content: {
          description: "Resolving copyright concerns:",
          process: [
            "Submit DMCA takedown request",
            "Provide ownership proof",
            "Counter-notification options",
            "Appeal reinstatement",
          ],
          contact: {
            email: "copyright@helpcenter.com",
            response: "48-hour initial response",
          },
        },
      },
      {
        title: "Content Analytics",
        icon: <FiDatabase className="w-6 h-6" />,
        content: {
          description: "Understanding content performance metrics:",
          metrics: [
            "Real-time view counts",
            "Audience demographics",
            "Engagement rates",
            "Trend analysis",
          ],
          tools: [
            "Export CSV reports",
            "Comparative timeline",
            "Competitor benchmarking",
          ],
        },
      },
      {
        title: "Scheduled Posts",
        icon: <FiClock className="w-6 h-6" />,
        content: {
          description: "Managing scheduled content:",
          features: [
            "Calendar view scheduling",
            "Bulk upload capabilities",
            "Timezone customization",
            "Edit before publishing",
          ],
          limits: {
            Free: "10 scheduled posts",
            Pro: "Unlimited scheduling",
            Teams: "Collaborative calendar",
          },
        },
      },
      {
        title: "Cross-Platform Sharing",
        icon: <FiSettings className="w-6 h-6" />,
        content: {
          description: "Share content across multiple platforms:",
          supported: ["Facebook", "Twitter/X", "Instagram", "LinkedIn"],
          settings: [
            "Auto-formatting options",
            "Scheduled cross-posting",
            "Analytics aggregation",
          ],
        },
      },
      {
        title: "Archived Content",
        icon: <FiDatabase className="w-6 h-6" />,
        content: {
          description: "Managing archived materials:",
          features: [
            "7-year retention policy",
            "Searchable archive",
            "Bulk export options",
            "Temporary restoration",
          ],
          access: [
            "Account history section",
            "Limited API access",
            "Encrypted storage",
          ],
        },
      },
    ],
    technical: [
      {
        title: "Mobile App Issues",
        icon: <FiSmartphone className="w-6 h-6" />,
        content: {
          description: "Troubleshoot common mobile app problems:",
          commonIssues: [
            "Push notifications not working",
            "App crashing on launch",
            "Slow performance",
            "Login persistence problems",
          ],
          troubleshooting: {
            steps: [
              "Check for updates",
              "Clear app cache",
              "Reinstall application",
              "Check device compatibility",
            ],
            contact: {
              email: "mobile-support@techhelp.com",
              responseTime: "Typically within 2 hours",
            },
          },
        },
      },
      {
        title: "Browser Compatibility",
        icon: <FiSettings className="w-6 h-6" />,
        content: {
          description: "Supported browsers and configurations:",
          supported: [
            "Chrome (latest 3 versions)",
            "Firefox (latest ESR)",
            "Safari (14+)",
            "Edge (Chromium-based)",
          ],
          requirements: {
            JavaScript: "ES2020+",
            Cookies: "Required",
            Extensions: "Ad blockers may interfere",
          },
        },
      },
      {
        title: "API Documentation",
        icon: <FiSettings className="w-6 h-6" />,
        content: {
          description: "Working with our developer API:",
          endpoints: [
            "GET /v1/user",
            "POST /v1/content",
            "PUT /v1/settings",
            "DELETE /v1/posts",
          ],
          auth: [
            "OAuth 2.0 implementation",
            "Rate limiting (1000 req/hour)",
            "Webhook configurations",
          ],
          docs: {
            link: "api.helpcenter.com/docs",
            sandbox: "Available for testing",
          },
        },
      },
      {
        title: "Data Usage Issues",
        icon: <FiDatabase className="w-6 h-6" />,
        content: {
          description: "Managing data storage and usage:",
          limits: {
            Free: "10GB storage",
            Pro: "1TB storage",
            Uploads: "2GB file size limit",
          },
          optimization: [
            "Automatic compression",
            "Batch processing",
            "CDN distribution",
          ],
        },
      },
      {
        title: "Video Playback Problems",
        icon: <FiVideo className="w-6 h-6" />,
        content: {
          description: "Resolve media playback issues:",
          checks: [
            "Internet speed (min 5Mbps)",
            "DRM compatibility",
            "Codec support (H.264/HEVC)",
            "Browser hardware acceleration",
          ],
          formats: ["MP4 (recommended)", "MOV", "AVI", "MKV"],
        },
      },
      {
        title: "Security Settings",
        icon: <FiShield className="w-6 h-6" />,
        content: {
          description: "Advanced security configurations:",
          features: [
            "IP allowlisting",
            "Session management",
            "Login attempt monitoring",
            "Data export controls",
          ],
          bestPractices: [
            "Monthly security audits",
            "Role-based access control",
            "Encrypted backups",
          ],
        },
      },
    ],
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setExpandedItem(null);
  };

  const filteredItems = () => {
    const items = helpCategories[selectedCategory];
    if (!searchQuery) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery) ||
        JSON.stringify(item.content).toLowerCase().includes(searchQuery)
    );
  };

  const renderContentSection = (title, items, icon) => (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      {Array.isArray(items) ? (
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2 text-gray-700">
          {Object.entries(items).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium">{key}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContactInfo = (contact) => (
    <div className="space-y-2">
      <h4 className="font-semibold mb-2">Contact Support:</h4>
      {contact.phone && (
        <div className="flex items-center gap-2 text-blue-600">
          <FiPhone className="flex-shrink-0" />
          <span>{contact.phone}</span>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-2 text-blue-600">
          <FiMail className="flex-shrink-0" />
          <span>{contact.email}</span>
        </div>
      )}
      {contact.hours && (
        <div className="flex items-center gap-2 text-gray-600">
          <FiClock className="flex-shrink-0" />
          <span>{contact.hours}</span>
        </div>
      )}
    </div>
  );

  const renderExpandedContent = (content) => (
    <div className="space-y-6">
      {content.description && (
        <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">
          {content.description}
        </p>
      )}

      {Object.entries(content).map(([key, value]) => {
        if (key === "description") return null;

        const sectionTitles = {
          steps: { title: "Step-by-Step Guide", icon: <FiSettings /> },
          prevention: { title: "Prevention Tips", icon: <FiLock /> },
          guidelines: { title: "Content Guidelines", icon: <FiFileText /> },
          appealProcess: { title: "Appeal Process", icon: <FiClock /> },
          troubleshooting: { title: "Troubleshooting", icon: <FiSettings /> },
          contact: { title: "Contact Support", icon: <FiMail /> },
          tips: { title: "Expert Tips", icon: <FiAlertCircle /> },
          methods: { title: "Available Methods", icon: <FiShield /> },
          limits: { title: "Account Limits", icon: <FiDatabase /> },
          requirements: { title: "System Requirements", icon: <FiSettings /> },
          bestPractices: { title: "Best Practices", icon: <FiShield /> },
        };

        const section = sectionTitles[key];
        if (!section) return null;

        return (
          <div key={key}>
            {key === "appealProcess" ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  {section.icon} {section.title}
                </h4>
                {value.steps && (
                  <>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-3">
                      {value.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-green-600">
                      {value.successRate}
                    </p>
                  </>
                )}
              </div>
            ) : key === "troubleshooting" ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  {section.icon} {section.title}
                </h4>
                {value.steps && (
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {value.steps.map((step, i) => (
                      <li key={i}>
                        {typeof step === "string"
                          ? step
                          : React.cloneElement(step)}
                      </li>
                    ))}
                  </ul>
                )}
                {value.contact && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    {renderContactInfo(value.contact)}
                  </div>
                )}
              </div>
            ) : (
              renderContentSection(section.title, value, section.icon)
            )}
          </div>
        );
      })}

      {content.contact && renderContactInfo(content.contact)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Help Center
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions and contact support
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, guides, and FAQs..."
            className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(helpCategories).map(([key, val]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCategory(key);
                setExpandedItem(null);
              }}
              className={`p-6 rounded-xl text-left transition-all ${
                selectedCategory === key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50 shadow-md"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedCategory === key ? "bg-blue-700" : "bg-blue-100"
                  }`}
                >
                  {val[0].icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Help
                  </h3>
                  <p className="text-sm mt-1 opacity-75">
                    {val.length} articles available
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems().map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>

                <div className="space-y-4">
                  {expandedItem === index ? (
                    <>
                      {renderExpandedContent(item.content)}
                      <button
                        onClick={() => setExpandedItem(null)}
                        className="mt-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FiArrowUpRight className="w-4 h-4 rotate-180" />
                        Collapse Article
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 line-clamp-3">
                        {item.content?.description}
                      </p>
                      <button
                        onClick={() => setExpandedItem(index)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <span>Read Full Article</span>
                        <FiArrowUpRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 text-white rounded-xl p-8 shadow-lg">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Still Need Help?</h2>
            <p className="text-lg opacity-90">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
              <a
                href="tel:+1-800-555-1234"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                <FiPhone className="w-5 h-5" />
                Call Support
              </a>
              <a
                href="mailto:support@helpcenter.com"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                <FiMail className="w-5 h-5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
