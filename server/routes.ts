import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertSubscriberSchema, insertTagSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed the database with initial data
  try {
    await (storage as any).seedData();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
  // API routes for blog functionality
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      
      const result = await storage.getPaginatedPosts(page, limit);
      
      // Fetch tags for each post
      const postsWithTags = await Promise.all(
        result.posts.map(async (post) => {
          const tags = await storage.getTagsByPostId(post.id);
          return { ...post, tags };
        })
      );
      
      res.json({
        posts: postsWithTags,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });
  
  app.get("/api/posts/featured", async (req: Request, res: Response) => {
    try {
      const featuredPost = await storage.getFeaturedPost();
      
      if (!featuredPost) {
        return res.status(404).json({ message: "No featured post found" });
      }
      
      const tags = await storage.getTagsByPostId(featuredPost.id);
      
      res.json({ ...featuredPost, tags });
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured post" });
    }
  });
  
  app.get("/api/posts/:slug", async (req: Request, res: Response) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const tags = await storage.getTagsByPostId(post.id);
      
      res.json({ ...post, tags });
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });
  
  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error creating post" });
      }
    }
  });
  
  app.get("/api/tags", async (req: Request, res: Response) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tags" });
    }
  });
  
  app.get("/api/tags/:slug", async (req: Request, res: Response) => {
    try {
      const tag = await storage.getTagBySlug(req.params.slug);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(tag);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tag" });
    }
  });
  
  app.get("/api/tags/:slug/posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPostsByTagSlug(req.params.slug);
      
      // Add tags to each post
      const postsWithTags = await Promise.all(
        posts.map(async (post) => {
          const tags = await storage.getTagsByPostId(post.id);
          return { ...post, tags };
        })
      );
      
      res.json(postsWithTags);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts by tag" });
    }
  });
  
  app.post("/api/tags", async (req: Request, res: Response) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error creating tag" });
      }
    }
  });
  
  app.post("/api/subscribe", async (req: Request, res: Response) => {
    try {
      const { email } = insertSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber({ email });
      res.status(201).json({ message: "Subscription successful" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Error processing subscription" });
      }
    }
  });
  
  // Generate RSS feed route
  app.get("/rss.xml", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      const postsWithTags = await Promise.all(
        posts.map(async (post) => {
          const tags = await storage.getTagsByPostId(post.id);
          return { ...post, tags };
        })
      );
      
      const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
      
      // Build the RSS XML
      let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DevBlog - Next.js and MDX Blog</title>
    <link>${baseUrl}</link>
    <description>A modern blog platform with powerful content management, dark mode, and advanced features.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;
      
      postsWithTags.forEach(post => {
        rss += `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid>${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`;
      });
      
      rss += `
  </channel>
</rss>`;
      
      res.set('Content-Type', 'application/xml');
      res.send(rss);
    } catch (error) {
      res.status(500).send("Error generating RSS feed");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
