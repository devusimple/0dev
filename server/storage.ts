import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  tags, type Tag, type InsertTag,
  postTags, type PostTag, type InsertPostTag,
  subscribers, type Subscriber, type InsertSubscriber
} from "@shared/schema";
import { db } from "./db";
import { and, count, desc, eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getAllPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getFeaturedPost(): Promise<Post | undefined>;
  getPaginatedPosts(page: number, limit: number): Promise<{posts: Post[], total: number}>;
  
  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTagById(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // Post-Tag operations
  getPostsByTagId(tagId: number): Promise<Post[]>;
  getPostsByTagSlug(tagSlug: string): Promise<Post[]>;
  getTagsByPostId(postId: number): Promise<Tag[]>;
  addTagToPost(postTag: InsertPostTag): Promise<PostTag>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;
  
  // Subscriber operations
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private tags: Map<number, Tag>;
  private postTags: Map<number, PostTag>;
  private subscribers: Map<number, Subscriber>;
  
  currentUserId: number;
  currentPostId: number;
  currentTagId: number;
  currentPostTagId: number;
  currentSubscriberId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.tags = new Map();
    this.postTags = new Map();
    this.subscribers = new Map();
    
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentTagId = 1;
    this.currentPostTagId = 1;
    this.currentSubscriberId = 1;
    
    // Seed initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Post operations
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(post => post.slug === slug);
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = { ...insertPost, id };
    this.posts.set(id, post);
    return post;
  }
  
  async updatePost(id: number, postUpdates: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...postUpdates };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  async getFeaturedPost(): Promise<Post | undefined> {
    const allPosts = await this.getAllPosts();
    return allPosts.length > 0 ? allPosts[0] : undefined;
  }
  
  async getPaginatedPosts(page: number, limit: number): Promise<{posts: Post[], total: number}> {
    const allPosts = await this.getAllPosts();
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      posts: allPosts.slice(startIndex, endIndex),
      total: allPosts.length
    };
  }
  
  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }
  
  async getTagById(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }
  
  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(tag => tag.slug === slug);
  }
  
  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentTagId++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }
  
  // Post-Tag operations
  async getPostsByTagId(tagId: number): Promise<Post[]> {
    // Get all postTags with tagId
    const postTagEntries = Array.from(this.postTags.values())
      .filter(pt => pt.tagId === tagId);
    
    // Get all posts based on postIds
    const postIds = postTagEntries.map(pt => pt.postId);
    const posts = Array.from(this.posts.values())
      .filter(post => postIds.includes(post.id))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return posts;
  }
  
  async getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
    const tag = await this.getTagBySlug(tagSlug);
    if (!tag) return [];
    
    return this.getPostsByTagId(tag.id);
  }
  
  async getTagsByPostId(postId: number): Promise<Tag[]> {
    // Get all postTags with postId
    const postTagEntries = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId);
    
    // Get all tags based on tagIds
    const tagIds = postTagEntries.map(pt => pt.tagId);
    const tags = Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
    
    return tags;
  }
  
  async addTagToPost(insertPostTag: InsertPostTag): Promise<PostTag> {
    const id = this.currentPostTagId++;
    const postTag: PostTag = { ...insertPostTag, id };
    this.postTags.set(id, postTag);
    return postTag;
  }
  
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    // Find the postTag entry
    const postTagEntry = Array.from(this.postTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (!postTagEntry) return false;
    
    return this.postTags.delete(postTagEntry.id);
  }
  
  // Subscriber operations
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.currentSubscriberId++;
    const subscriber: Subscriber = { 
      ...insertSubscriber, 
      id, 
      createdAt: new Date() 
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values())
      .find(sub => sub.email === email);
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  // Seed initial data
  private async seedData() {
    // Seed author
    const author = await this.createUser({
      username: "admin",
      password: "admin123"
    });
    
    // Seed tags
    const tags: Tag[] = [];
    const tagNames = ["Next.js", "MDX", "React", "Routing", "Web Development", "Advanced", "Components", "Performance", "Images", "Tailwind CSS", "Dark Mode", "CSS", "RSS", "SEO"];
    
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      const tag = await this.createTag({ name, slug });
      tags.push(tag);
    }
    
    // Seed posts
    const posts = [
      {
        slug: "getting-started-with-nextjs-and-mdx",
        title: "Getting Started with Next.js and MDX",
        excerpt: "Learn how to set up a blog with Next.js and MDX for powerful content management.",
        content: `
# Getting Started with Next.js and MDX

Next.js has become one of the most popular React frameworks for building modern web applications. Combined with MDX (Markdown for the component era), it provides a powerful platform for creating content-rich websites like blogs, documentation sites, and more.

In this comprehensive guide, we'll walk through setting up a Next.js project with MDX support, configuring it for optimal performance, and implementing common blog features like:

- Dynamic routing for blog posts
- Frontmatter parsing for metadata
- Custom components in markdown
- Syntax highlighting for code blocks
- And more!

## Setting Up Your Next.js Project

First, let's create a new Next.js project. Open your terminal and run:

\`\`\`bash
npx create-next-app my-blog-app
cd my-blog-app
\`\`\`

Now, let's install the dependencies we need for MDX support:

\`\`\`bash
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter
\`\`\`

## Configuring Next.js for MDX

Next, we need to configure Next.js to recognize and process MDX files. Create or update your \`next.config.js\` file:

\`\`\`javascript
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
})
\`\`\`

## Creating Your First MDX Blog Post

Now, let's create a sample blog post. Create a new directory called \`posts\` in your project root,
and add a new file called \`hello-world.mdx\`:

\`\`\`markdown
---
title: Hello World
date: '2023-06-15'
tags: ['next.js', 'mdx', 'react']
---

# Hello World!

This is my first blog post using **MDX**!

## Code Example

\`\`\`jsx
function HelloWorld() {
  return \`<div>Hello, world!</div>\`
}

export default HelloWorld
\`\`\`
\`\`\`

In the next sections, we'll explore how to:

1. Set up dynamic routing for blog posts
2. Parse frontmatter metadata
3. Create reusable components for your MDX files
4. Implement code syntax highlighting
5. Add features like table of contents and reading time

## Next Steps

Stay tuned for the next part of this series where we'll dive deeper into creating a full-featured blog with Next.js and MDX!
        `,
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-06-15"),
        readingTime: "5 min read",
        authorId: author.id
      },
      {
        slug: "creating-dynamic-routes-in-nextjs",
        title: "Creating Dynamic Routes in Next.js",
        excerpt: "Explore how to implement dynamic routing in Next.js for your blog posts and category pages.",
        content: `
# Creating Dynamic Routes in Next.js

Dynamic routing is a powerful feature in Next.js that allows you to create pages with paths that depend on external data. This is perfect for blogs, e-commerce sites, and any application where URLs need to be generated dynamically.

## Understanding Dynamic Routes

In Next.js, you can create dynamic routes by adding square brackets to a page filename. For example, \`pages/posts/[slug].js\` will match \`/posts/hello-world\`, \`/posts/learn-nextjs\`, etc.

## Setting Up Dynamic Routes for Blog Posts

Let's create a dynamic route for our blog posts:

\`\`\`jsx
// pages/posts/[slug].js
import { useRouter } from 'next/router'
import { getAllPostSlugs, getPostBySlug } from '../../lib/posts'

export default function Post({ post }) {
  const router = useRouter()
  
  // If the page is still being generated, show a loading state
  if (router.isFallback) {
    return \`<div>Loading...</div>\`
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

export async function getStaticPaths() {
  const slugs = getAllPostSlugs()
  
  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug)
  
  return {
    props: {
      post,
    },
  }
}
\`\`\`

## Creating Category Pages with Dynamic Routes

You can also use dynamic routes for category or tag pages:

\`\`\`jsx
// pages/categories/[category].js
import { useRouter } from 'next/router'
import { getAllCategories, getPostsByCategory } from '../../lib/posts'

export default function Category({ posts, category }) {
  const router = useRouter()
  
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return \`
    <div>
      <h1>Posts in {category}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={\`/posts/\${post.slug}\`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  \`
}

export async function getStaticPaths() {
  const categories = getAllCategories()
  
  return {
    paths: categories.map((category) => ({
      params: { category },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const posts = getPostsByCategory(params.category)
  
  return {
    props: {
      posts,
      category: params.category,
    },
  }
}
\`\`\`

## Advanced Routing Patterns

Next.js also supports more complex routing patterns:

1. **Catch-all routes**: \`pages/posts/[...slug].js\` matches \`/posts/2020/01/01/hello-world\`
2. **Optional catch-all routes**: \`pages/posts/[[...slug]].js\` matches both \`/posts\` and \`/posts/a/b/c\`

## Conclusion

Dynamic routing in Next.js provides a powerful way to build pages based on data. Whether you're creating a blog, documentation site, or e-commerce platform, mastering dynamic routes will help you create a flexible, maintainable application architecture.
        `,
        coverImage: "https://images.unsplash.com/photo-1546900703-cf06143d1239?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-06-10"),
        readingTime: "7 min read",
        authorId: author.id
      },
      {
        slug: "advanced-mdx-techniques",
        title: "Advanced MDX Techniques",
        excerpt: "Take your MDX skills to the next level with custom components and dynamic content.",
        content: `
# Advanced MDX Techniques

MDX combines the simplicity of Markdown with the power of JSX, allowing you to embed React components directly in your content. In this article, we'll explore advanced MDX techniques to take your content to the next level.

## Custom Components in MDX

One of the most powerful features of MDX is the ability to use custom React components in your markdown:

\`\`\`jsx
import { Alert } from '../components/Alert'

# Using Custom Components

<Alert type="info">
  This is an informational alert using a custom component!
</Alert>

You can continue writing markdown as usual...
\`\`\`

## Creating an MDX Provider

To make components available throughout your MDX files without importing them in each file, you can use an MDX Provider:

\`\`\`jsx
// components/MDXProvider.jsx
import { MDXProvider } from '@mdx-js/react'
import { CodeBlock } from './CodeBlock'
import { Alert } from './Alert'
import { YouTube } from './YouTube'

const components = {
  pre: CodeBlock,
  Alert,
  YouTube,
  // You can also override default HTML elements
  h1: (props) => <h1 className="text-3xl font-bold" {...props} />,
  h2: (props) => <h2 className="text-2xl font-semibold mt-6" {...props} />,
}

export function MDXLayout({ children }) {
  return <MDXProvider components={components}>{children}</MDXProvider>
}
\`\`\`

## Interactive Components

MDX really shines when you add interactive components:

\`\`\`jsx
// Example MDX file
import { useState } from 'react'

# Interactive Counter

export const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

<Counter />

Continue with more markdown content...
\`\`\`

## Dynamic Content in MDX

You can also make your MDX files dynamic by passing props to them:

\`\`\`jsx
// pages/posts/[slug].js
import { getMDXComponent } from 'mdx-bundler/client'
import { getAllPosts, getPostBySlug } from '../../lib/mdx'
import { useMemo } from 'react'

export default function Post({ post }) {
  // This converts the MDX string into a React component
  const Component = useMemo(() => {
    if (!post.code) return null
    return getMDXComponent(post.code)
  }, [post.code])
  
  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      {/* Pass custom props to your MDX content */}
      <Component userName="John" />
    </article>
  )
}
\`\`\`

## Advanced Syntax Highlighting

For advanced code blocks with line highlighting, copy buttons, and more:

\`\`\`jsx
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import { useState } from 'react'

export function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace(/language-/, '') || 'text'
  
  const copyCode = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Highlight the code with Prism
  const html = Prism.highlight(children, Prism.languages[language], language)
  
  return (
    <div className="relative">
      <pre className={className}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      <button 
        className="absolute top-2 right-2" 
        onClick={copyCode}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
\`\`\`

## Conclusion

MDX provides a powerful way to combine the simplicity of Markdown with the dynamic capabilities of React. By leveraging custom components, MDX providers, and interactive elements, you can create rich, engaging content experiences that go far beyond what traditional Markdown can offer.
        `,
        coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-06-05"),
        readingTime: "9 min read",
        authorId: author.id
      },
      {
        slug: "optimizing-images-in-nextjs",
        title: "Optimizing Images in Next.js",
        excerpt: "Learn best practices for image optimization in Next.js using the Image component.",
        content: `
# Optimizing Images in Next.js

Images often account for the largest portion of page weight and can significantly impact performance and user experience. Next.js provides built-in image optimization through its \`Image\` component, which helps solve many common image-related issues.

## Why Image Optimization Matters

Unoptimized images can lead to:
- Slower page loads
- Higher bandwidth usage
- Poor Core Web Vitals scores
- Reduced SEO performance
- Battery drain on mobile devices

## Using the Next.js Image Component

The \`Image\` component in Next.js provides several optimizations out of the box:

\`\`\`jsx
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <div>
      <h1>Optimized Image Example</h1>
      <Image
        src="/images/hero.jpg"
        alt="Hero image"
        width={1200}
        height={600}
        priority
      />
    </div>
  )
}
\`\`\`

Key features of the \`Image\` component:

1. **Automatic Webp conversion**: Serves images in modern formats like WebP when the browser supports them
2. **Lazy loading**: Only loads images when they enter the viewport
3. **Responsive resizing**: Automatically serves the right size image for each device
4. **Preventing layout shift**: Reserves space for images to avoid CLS (Cumulative Layout Shift)

## Working with Remote Images

For remote images, you need to configure domains in your \`next.config.js\`:

\`\`\`javascript
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
  },
}
\`\`\`

Then you can use remote images:

\`\`\`jsx
<Image
  src="https://example.com/profile.jpg"
  alt="Profile Picture"
  width={500}
  height={500}
/>
\`\`\`

## Responsive Images

To make images responsive while maintaining aspect ratio:

\`\`\`jsx
<div className="relative w-full h-[300px] md:h-[500px]">
  <Image
    src="/images/hero.jpg"
    alt="Hero image"
    fill
    style={{ objectFit: 'cover' }}
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
\`\`\`

The \`sizes\` attribute tells the browser what size image to download at different screen widths, optimizing bandwidth usage.

## Image Loading Priority

For above-the-fold images, use the \`priority\` attribute to preload them:

\`\`\`jsx
<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
/>
\`\`\`

## Placeholder Images

You can show a blur-up placeholder while the image loads:

\`\`\`jsx
<Image
  src="/images/product.jpg"
  alt="Product"
  width={500}
  height={500}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgg"
/>
\`\`\`

## Performance Best Practices

1. **Use the \`width\` and \`height\` props**: Always specify dimensions to prevent layout shift
2. **Set the \`sizes\` attribute**: Help browsers download the right size image
3. **Use \`priority\` for LCP images**: Mark important above-the-fold images
4. **Consider using \`loading="eager"\`**: For images just below the fold that will be viewed quickly
5. **Optimize your source images**: Even though Next.js optimizes delivery, start with well-compressed source files

## Conclusion

The Next.js Image component handles most of the heavy lifting for image optimization, giving you better performance with minimal effort. By implementing these best practices, you can ensure your Next.js application delivers a fast, visually appealing experience while minimizing bandwidth usage.
        `,
        coverImage: "https://images.unsplash.com/photo-1517650862521-d580d5348145?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-05-28"),
        readingTime: "6 min read",
        authorId: author.id
      },
      {
        slug: "implementing-dark-mode-with-tailwind-css",
        title: "Implementing Dark Mode with Tailwind CSS",
        excerpt: "A comprehensive guide to adding dark mode support to your Next.js blog.",
        content: `
# Implementing Dark Mode with Tailwind CSS

Dark mode has become a standard feature for modern websites, offering users a more comfortable viewing experience in low-light conditions and potentially reducing battery usage on OLED screens. In this guide, we'll implement a robust dark mode solution for Next.js using Tailwind CSS.

## Setting Up Tailwind CSS for Dark Mode

First, configure Tailwind CSS to support dark mode in your \`tailwind.config.js\`:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference-based
  // ... rest of your config
}
\`\`\`

The \`darkMode: 'class'\` setting enables class-based toggling, which gives users the ability to choose their preferred mode regardless of system settings.

## Creating a Theme Provider

Next, create a theme provider context to manage the dark mode state:

\`\`\`jsx
// components/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // On mount, read from localStorage and system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
\`\`\`

## Implementing the Theme Toggle Button

Create a toggle button component:

\`\`\`jsx
// components/ThemeToggle.jsx
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}
\`\`\`

## Adding Dark Mode Styles with Tailwind

Tailwind CSS makes it easy to add dark mode styles with the \`dark:\` variant:

\`\`\`jsx
// Example component with dark mode styles
function Card({ title, content }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <p className="text-gray-700 dark:text-gray-300">{content}</p>
    </div>
  )
}
\`\`\`

## Wrapping Your Application

Finally, wrap your application with the \`ThemeProvider\`:

\`\`\`jsx
// pages/_app.js
import { ThemeProvider } from '../components/ThemeProvider'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
\`\`\`

## Preventing Flash of Incorrect Theme

To prevent a flash of the wrong theme on page load, add this script to the \`<head>\` in your document:

\`\`\`jsx
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <script dangerouslySetInnerHTML={{
          __html: \`
            (function() {
              try {
                var mode = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (mode === 'dark' || (!mode && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          \`
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
\`\`\`

## System Preference Sync

To keep dark mode in sync with system preferences, add an event listener:

\`\`\`jsx
// In ThemeProvider.jsx, add to the useEffect
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e) => {
    // Only change if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        setTheme('dark')
        document.documentElement.classList.add('dark')
      } else {
        setTheme('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [])
\`\`\`

## Conclusion

With Tailwind CSS and React context, implementing dark mode in Next.js becomes a straightforward process. The solution we've built offers:

1. User preference storage
2. System preference detection
3. Smooth transitions between modes
4. No flash of incorrect theme
5. Easy-to-maintain styles with Tailwind's \`dark:\` variant

This implementation provides a solid foundation for dark mode support in your Next.js application, enhancing user experience while adhering to modern web standards.
        `,
        coverImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-05-20"),
        readingTime: "8 min read",
        authorId: author.id
      },
      {
        slug: "building-a-custom-rss-feed-for-your-blog",
        title: "Building a Custom RSS Feed for Your Blog",
        excerpt: "Step-by-step instructions for creating an RSS feed for your Next.js blog.",
        content: `
# Building a Custom RSS Feed for Your Blog

RSS (Really Simple Syndication) feeds allow readers to subscribe to your blog and receive updates whenever you publish new content. Despite the rise of social media, RSS remains a valuable tool for content distribution and maintaining a direct connection with your audience.

## Why Your Blog Needs an RSS Feed

1. **Reader Convenience**: Allows readers to consume your content on their preferred RSS reader
2. **SEO Benefits**: Helps search engines discover and index your content more efficiently
3. **Content Distribution**: Enables automatic syndication to other platforms
4. **Analytics Tracking**: Provides valuable data about subscriber engagement
5. **Platform Independence**: Gives you direct access to your audience without algorithm changes

## Setting Up an RSS Feed Generator in Next.js

First, install the required package:

\`\`\`bash
npm install rss
\`\`\`

Next, create a utility function to generate your RSS feed:

\`\`\`javascript
// lib/rss.js
import { Feed } from 'feed'
import fs from 'fs'
import { getAllPosts } from './posts'

export async function generateRssFeed() {
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'
  const posts = getAllPosts()
  
  const feedOptions = {
    title: 'Your Blog Title',
    description: 'Your blog description',
    id: site_url,
    link: site_url,
    image: \`\${site_url}/logo.png\`,
    favicon: \`\${site_url}/favicon.ico\`,
    copyright: \`All rights reserved \${new Date().getFullYear()}, Your Name\`,
    updated: new Date(posts[0].publishedAt),
    generator: 'Next.js using Feed for Node.js',
    feedLinks: {
      rss2: \`\${site_url}/rss.xml\`,
      json: \`\${site_url}/feed.json\`,
      atom: \`\${site_url}/atom.xml\`,
    },
    author: {
      name: 'Your Name',
      email: 'your.email@example.com',
      link: site_url,
    },
  }
  
  const feed = new Feed(feedOptions)
  
  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: \`\${site_url}/posts/\${post.slug}\`,
      link: \`\${site_url}/posts/\${post.slug}\`,
      description: post.excerpt,
      content: post.content,
      author: [
        {
          name: 'Your Name',
          email: 'your.email@example.com',
          link: site_url,
        },
      ],
      date: new Date(post.publishedAt),
      image: post.coverImage,
    })
  })
  
  fs.writeFileSync('./public/rss.xml', feed.rss2())
  fs.writeFileSync('./public/feed.json', feed.json1())
  fs.writeFileSync('./public/atom.xml', feed.atom1())
}
\`\`\`

## Generating the RSS Feed at Build Time

To generate the RSS feed when you build your site, update your \`next.config.js\`:

\`\`\`javascript
// next.config.js
const { generateRssFeed } = require('./lib/rss')

module.exports = {
  // Other Next.js config...
  
  // Generate RSS feed during build
  async redirects() {
    // Run the RSS generator
    if (process.env.NODE_ENV === 'production') {
      await generateRssFeed()
    }
    return []
  }
}
\`\`\`

## Adding RSS Links to Your Site's Head

Include links to your RSS feeds in your site's head to help browsers and feed readers discover them:

\`\`\`jsx
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
        <link rel="alternate" type="application/json" title="JSON Feed" href="/feed.json" />
        <link rel="alternate" type="application/atom+xml" title="Atom" href="/atom.xml" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
\`\`\`

## Creating an API Endpoint for Dynamic RSS Generation

Alternatively, you can create an API endpoint that generates the RSS feed on demand:

\`\`\`javascript
// pages/api/rss.js
import { Feed } from 'feed'
import { getAllPosts } from '../../lib/posts'

export default function handler(req, res) {
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'
  const posts = getAllPosts()
  
  const feedOptions = {
    title: 'Your Blog Title',
    description: 'Your blog description',
    id: site_url,
    link: site_url,
    image: \`\${site_url}/logo.png\`,
    favicon: \`\${site_url}/favicon.ico\`,
    copyright: \`All rights reserved \${new Date().getFullYear()}, Your Name\`,
    updated: new Date(posts[0].publishedAt),
    generator: 'Next.js using Feed for Node.js',
    feedLinks: {
      rss2: \`\${site_url}/api/rss\`,
      json: \`\${site_url}/api/feed.json\`,
      atom: \`\${site_url}/api/atom\`,
    },
    author: {
      name: 'Your Name',
      email: 'your.email@example.com',
      link: site_url,
    },
  }
  
  const feed = new Feed(feedOptions)
  
  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: \`\${site_url}/posts/\${post.slug}\`,
      link: \`\${site_url}/posts/\${post.slug}\`,
      description: post.excerpt,
      content: post.content,
      author: [
        {
          name: 'Your Name',
          email: 'your.email@example.com',
          link: site_url,
        },
      ],
      date: new Date(post.publishedAt),
      image: post.coverImage,
    })
  })
  
  res.setHeader('Content-Type', 'application/rss+xml')
  res.write(feed.rss2())
  res.end()
}
\`\`\`

## Adding a Subscribe Button to Your Blog

Make it easy for readers to subscribe with an RSS button:

\`\`\`jsx
function SubscribeButton() {
  return (
    <a 
      href="/rss.xml" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md"
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
        <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
        <path d="M3 15a2 2 0 114 0 2 2 0 01-4 0z" />
      </svg>
      Subscribe via RSS
    </a>
  )
}
\`\`\`

## Validating Your RSS Feed

After implementing your RSS feed, validate it using online tools like:

1. [W3C Feed Validation Service](https://validator.w3.org/feed/)
2. [RSS Validator](https://www.rssboard.org/rss-validator/)

This ensures your feed is correctly formatted and will work across all RSS readers.

## Conclusion

Implementing an RSS feed is a simple yet effective way to distribute your content and maintain a direct connection with your audience. By following this guide, you've added a professional feature to your Next.js blog that both readers and search engines will appreciate.
        `,
        coverImage: "https://images.unsplash.com/photo-1614064548237-096d2cfe18f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        publishedAt: new Date("2023-05-15"),
        readingTime: "4 min read",
        authorId: author.id
      }
    ];
    
    for (const postData of posts) {
      const post = await this.createPost(postData);
      
      // Add tags to post
      const tagNames = postData.title.match(/Next\.js|MDX|React|Dynamic|Routes|Advanced|Components|Performance|Images|Tailwind CSS|Dark Mode|CSS|RSS|Web Development|SEO/g) || [];
      const uniqueTagNames = [...new Set(tagNames)];
      
      for (const tagName of uniqueTagNames) {
        const tag = await this.getTagBySlug(tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''));
        if (tag) {
          await this.addTagToPost({
            postId: post.id,
            tagId: tag.id
          });
        }
      }
    }
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Post operations
  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.publishedAt));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: number, postUpdates: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set(postUpdates)
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    // First delete any post-tag relationships
    await db.delete(postTags).where(eq(postTags.postId, id));
    
    // Then delete the post
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    return post || undefined;
  }

  async getPaginatedPosts(page: number, limit: number): Promise<{posts: Post[], total: number}> {
    const offset = (page - 1) * limit;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(posts);
    
    const total = totalResult?.count || 0;
    
    const postsResult = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
      
    return {
      posts: postsResult,
      total: Number(total)
    };
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async getTagById(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag || undefined;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  // Post-Tag operations
  async getPostsByTagId(tagId: number): Promise<Post[]> {
    return db
      .select({ post: posts })
      .from(posts)
      .innerJoin(postTags, eq(posts.id, postTags.postId))
      .where(eq(postTags.tagId, tagId))
      .orderBy(desc(posts.publishedAt))
      .then(results => results.map(result => result.post));
  }

  async getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
    const tag = await this.getTagBySlug(tagSlug);
    if (!tag) return [];
    
    return this.getPostsByTagId(tag.id);
  }

  async getTagsByPostId(postId: number): Promise<Tag[]> {
    return db
      .select({ tag: tags })
      .from(tags)
      .innerJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(postTags.postId, postId))
      .then(results => results.map(result => result.tag));
  }

  async addTagToPost(insertPostTag: InsertPostTag): Promise<PostTag> {
    const [postTag] = await db
      .insert(postTags)
      .values(insertPostTag)
      .returning();
    return postTag;
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(postTags)
      .where(and(
        eq(postTags.postId, postId),
        eq(postTags.tagId, tagId)
      ))
      .returning();
    
    return result.length > 0;
  }

  // Subscriber operations
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email));
    return subscriber || undefined;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(subscribers);
  }

  // Seed the database with initial data
  async seedData() {
    // Check if we already have users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    console.log("Seeding database...");
    
    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: "admin123"
      })
      .returning();
    
    // Create tags
    const tagNames = ["Next.js", "MDX", "React", "Routing", "Web Development", "Advanced", 
                      "Components", "Performance", "Images", "Tailwind CSS", "Dark Mode", 
                      "CSS", "RSS", "SEO"];
    
    const createdTags: Tag[] = [];
    
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      const [tag] = await db
        .insert(tags)
        .values({ name, slug })
        .returning();
      createdTags.push(tag);
    }
    
    // Create sample posts
    const samplePosts = [
      {
        slug: "getting-started-with-nextjs-and-mdx",
        title: "Getting Started with Next.js and MDX",
        excerpt: "Learn how to set up a blog with Next.js and MDX for powerful content management.",
        content: `# Getting Started with Next.js and MDX

Next.js has become one of the most popular React frameworks for building modern web applications. Combined with MDX (Markdown for the component era), it provides a powerful platform for creating content-rich websites like blogs, documentation sites, and more.

## Setting Up Your Next.js Project

First, let's create a new Next.js project. Open your terminal and run:

\`\`\`bash
npx create-next-app my-blog-app
cd my-blog-app
\`\`\`

Now, let's install the dependencies we need for MDX support:

\`\`\`bash
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter
\`\`\`

## Creating Your First MDX Blog Post

Now, let's create a sample blog post. Create a new directory called \`posts\` in your project root,
and add a new file called \`hello-world.mdx\`.
`,
        publishedAt: new Date("2023-06-15"),
        readingTime: "5 min read",
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        authorId: admin.id
      },
      {
        slug: "creating-dynamic-routes-in-nextjs",
        title: "Creating Dynamic Routes in Next.js",
        excerpt: "Explore how to implement dynamic routing in Next.js for your blog posts and category pages.",
        content: `# Creating Dynamic Routes in Next.js

Dynamic routing is a powerful feature in Next.js that allows you to create pages with paths that depend on external data. This is perfect for blogs, e-commerce sites, and any application where URLs need to be generated dynamically.

## Understanding Dynamic Routes

In Next.js, you can create dynamic routes by adding square brackets to a page filename. For example, \`pages/posts/[slug].js\` will match \`/posts/hello-world\`, \`/posts/learn-nextjs\`, etc.

## Setting Up Dynamic Routes for Blog Posts

Let's create a dynamic route for our blog posts.
`,
        publishedAt: new Date("2023-06-10"),
        readingTime: "7 min read",
        coverImage: "https://images.unsplash.com/photo-1546900703-cf06143d1239?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        authorId: admin.id
      },
      {
        slug: "advanced-mdx-techniques",
        title: "Advanced MDX Techniques",
        excerpt: "Take your MDX skills to the next level with custom components and dynamic content.",
        content: `# Advanced MDX Techniques

MDX combines the simplicity of Markdown with the power of JSX, allowing you to embed React components directly in your content. In this article, we'll explore advanced MDX techniques to take your content to the next level.

## Custom Components in MDX

One of the most powerful features of MDX is the ability to use custom React components in your markdown.
`,
        publishedAt: new Date("2023-06-05"),
        readingTime: "8 min read",
        coverImage: "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        authorId: admin.id
      }
    ];
    
    for (const postData of samplePosts) {
      const [post] = await db
        .insert(posts)
        .values(postData)
        .returning();
      
      // Add some tags to each post (random selection)
      const selectedTags = createdTags
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 2);
      
      for (const tag of selectedTags) {
        await db
          .insert(postTags)
          .values({
            postId: post.id,
            tagId: tag.id
          });
      }
    }
    
    console.log("Database seeded successfully");
  }
}

// Export a new instance of DatabaseStorage
export const storage = new DatabaseStorage();
