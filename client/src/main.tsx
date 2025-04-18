// Import polyfills first to ensure they're available
import "./lib/polyfills";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "DevBlog - Next.js Blog Platform";

// Add meta tags for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'A modern blog platform with MDX support, dark mode, and advanced features';
document.head.appendChild(metaDescription);

const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
document.head.appendChild(metaViewport);

// Add Open Graph meta tags
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'DevBlog - Next.js Blog Platform';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'A modern blog platform with MDX support, dark mode, and advanced features';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.property = 'og:type';
ogType.content = 'website';
document.head.appendChild(ogType);

// Add link to Google Fonts
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
document.head.appendChild(fontLink);

// Add links for RSS feed
const rssLink = document.createElement('link');
rssLink.rel = 'alternate';
rssLink.type = 'application/rss+xml';
rssLink.title = 'RSS Feed for DevBlog';
rssLink.href = '/rss.xml';
document.head.appendChild(rssLink);

// Add preconnect for Google Fonts
const preconnect1 = document.createElement('link');
preconnect1.rel = 'preconnect';
preconnect1.href = 'https://fonts.googleapis.com';
document.head.appendChild(preconnect1);

const preconnect2 = document.createElement('link');
preconnect2.rel = 'preconnect';
preconnect2.href = 'https://fonts.gstatic.com';
preconnect2.crossOrigin = '';
document.head.appendChild(preconnect2);

createRoot(document.getElementById("root")!).render(<App />);
