import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { parseMDXContent, generateTableOfContents, addHeadingIds } from "@/lib/mdx";
import { useState, useEffect } from "react";
import ShareButtons from "@/components/blog/share-buttons";
import TableOfContents from "@/components/blog/table-of-contents";
import RelatedPosts from "@/components/blog/related-posts";
import CommentSection from "@/components/blog/comment-section";
import NewsletterForm from "@/components/blog/newsletter-form";
import MDXComponents from "@/components/blog/mdx/mdx-components";

export default function PostDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState<string>("");
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);

  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${slug}`],
  });

  useEffect(() => {
    if (post?.content) {
      const processContent = async () => {
        try {
          // Generate table of contents
          const toc = generateTableOfContents(post.content);
          setTableOfContents(toc);

          // Process MDX content with custom components
          const { content: htmlContent } = await parseMDXContent(post.content);
          
          // Add IDs to headings for TOC linking
          const contentWithHeadingIds = addHeadingIds(htmlContent);
          setContent(contentWithHeadingIds);
        } catch (error) {
          console.error("Error processing MDX content:", error);
          setContent('<p>Error processing content</p>');
        }
      };

      processContent();
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link href="/posts">
          <Button>Back to all posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-900 pb-12">
      <article>
        {/* Post Header */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/posts">
                  <a className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:underline mb-4">
                    <svg
                      className="mr-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to all posts
                  </a>
                </Link>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <a>
                        <Badge className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800">
                          {tag.name}
                        </Badge>
                      </a>
                    </Link>
                  ))}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-6">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readingTime}</span>
                  <span className="mx-2">•</span>
                  <span>by Admin</span>
                </div>
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-64 sm:h-96 object-cover rounded-xl"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
              <div className="lg:w-64 order-2 lg:order-1">
                <div className="sticky top-24 space-y-8">
                  {/* Social Share Buttons */}
                  <ShareButtons title={post.title} slug={post.slug} />
                  
                  {/* Table of Contents */}
                  {tableOfContents.length > 0 && (
                    <TableOfContents headings={tableOfContents} />
                  )}
                </div>
              </div>
              
              <div className="lg:flex-1 order-1 lg:order-2">
                {/* Render MDX Content */}
                <div 
                  className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-img:rounded-xl max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                
                {/* Social Share Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Share this article
                  </h3>
                  <ShareButtons title={post.title} slug={post.slug} large />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        <RelatedPosts currentPostId={post.id} tags={post.tags.map(tag => tag.id)} />

        {/* Comments */}
        <CommentSection postId={post.id} />
      </article>
      
      {/* Newsletter */}
      <NewsletterForm />
    </main>
  );
}
