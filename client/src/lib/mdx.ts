// Import only the browser-safe utilities
import { estimateReadingTime } from './utils';

// Types for post metadata
export interface PostFrontmatter {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage?: string;
  author?: string;
}

// Browser-compatible version of MDX parsing
// This version doesn't use Node.js-specific modules like 'fs'
export async function parseMDXContent(content: string) {
  // Extract frontmatter
  const matterResult = extractFrontmatter(content);
  
  // Simple Markdown to HTML conversion (without remark/unified)
  // This is a basic implementation that handles common Markdown syntax
  const htmlContent = simpleMarkdownToHtml(content);
  
  // Calculate reading time
  const readingTime = estimateReadingTime(content);
  
  return {
    frontmatter: matterResult,
    content: htmlContent,
    readingTime,
  };
}

// Extract frontmatter data from content
function extractFrontmatter(content: string): PostFrontmatter {
  const frontmatter: Partial<PostFrontmatter> = {};
  
  // Basic regex pattern to extract frontmatter
  const frontmatterRegex = /---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (match && match[1]) {
    const frontmatterBlock = match[1];
    
    // Extract each property
    const titleMatch = frontmatterBlock.match(/title:\s*(['"])(.*?)\1/);
    if (titleMatch) frontmatter.title = titleMatch[2];
    
    const dateMatch = frontmatterBlock.match(/date:\s*(['"])(.*?)\1/);
    if (dateMatch) frontmatter.date = dateMatch[2];
    
    const excerptMatch = frontmatterBlock.match(/excerpt:\s*(['"])(.*?)\1/);
    if (excerptMatch) frontmatter.excerpt = excerptMatch[2];
    
    const coverImageMatch = frontmatterBlock.match(/coverImage:\s*(['"])(.*?)\1/);
    if (coverImageMatch) frontmatter.coverImage = coverImageMatch[2];
    
    const authorMatch = frontmatterBlock.match(/author:\s*(['"])(.*?)\1/);
    if (authorMatch) frontmatter.author = authorMatch[2];
    
    // Extract tags array
    const tagsMatch = frontmatterBlock.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      frontmatter.tags = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim().replace(/['"]/g, ''));
    }
  }
  
  return {
    title: frontmatter.title || 'Untitled Post',
    date: frontmatter.date || new Date().toISOString(),
    tags: frontmatter.tags || [],
    excerpt: frontmatter.excerpt || '',
    coverImage: frontmatter.coverImage,
    author: frontmatter.author,
  };
}

// Simple Markdown to HTML converter (browser-compatible)
function simpleMarkdownToHtml(markdown: string): string {
  // Remove frontmatter
  const contentWithoutFrontmatter = markdown.replace(/---\n[\s\S]*?\n---/, '');
  
  // Process content with basic Markdown syntax
  let html = contentWithoutFrontmatter
    // Handle headings (# Heading)
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Handle bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Handle italic (*text*)
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Handle code blocks (```)
    .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    
    // Handle inline code (`code`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Handle links ([text](url))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Handle images (![alt](url))
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    
    // Handle unordered lists
    .replace(/^\s*?- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
    
    // Handle ordered lists
    .replace(/^\s*?\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>')
    
    // Handle paragraphs
    .replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>');
  
  return html;
}

// Generate table of contents from content
export function generateTableOfContents(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  
  // Match all headings (## Heading)
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');
    
    headings.push({ id, text, level });
  }
  
  return headings;
}

// Add IDs to headings in HTML content for linking
export function addHeadingIds(htmlContent: string): string {
  return htmlContent.replace(
    /<(h[2-4])>(.*?)<\/h[2-4]>/g,
    (_, tag, content) => {
      const id = content
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
      
      return `<${tag} id="${id}">${content}</${tag}>`;
    }
  );
}
