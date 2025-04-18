import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeaturedPost from "@/components/blog/featured-post";
import PostCard from "@/components/blog/post-card";
import NewsletterForm from "@/components/blog/newsletter-form";

export default function Home() {
  const { data: featuredPostData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["/api/posts/featured"],
  });

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-500 dark:from-primary-900 dark:to-purple-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Next.js Blog with MDX
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              A modern blog platform with powerful content management, dark mode, and advanced features.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/posts">
                <a>
                  <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                    Get Started
                  </Button>
                </a>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="bg-transparent border border-white text-white hover:bg-white/10">
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Post
            </h2>
            <Link href="/posts">
              <a className="text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center">
                <span>View all posts</span>
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </Link>
          </div>

          {isFeaturedLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredPostData ? (
            <FeaturedPost post={featuredPostData} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No featured post available</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Latest Articles
          </h2>

          {isPostsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : postsData?.posts?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {postsData.posts.slice(0, 6).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No posts available</p>
            </div>
          )}

          {postsData?.posts?.length > 6 && (
            <div className="mt-10 text-center">
              <Link href="/posts">
                <a>
                  <Button variant="outline" className="px-6">
                    View all articles
                  </Button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterForm />
    </main>
  );
}
