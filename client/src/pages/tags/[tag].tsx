import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/post-card";
import TagFilter from "@/components/blog/tag-filter";
import NewsletterForm from "@/components/blog/newsletter-form";

export default function TagPosts() {
  const { tag } = useParams();
  
  const { data: tagData, isLoading: isTagLoading } = useQuery({
    queryKey: [`/api/tags/${tag}`],
  });
  
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: [`/api/tags/${tag}/posts`],
  });
  
  const isLoading = isTagLoading || isPostsLoading;

  return (
    <main>
      {/* Page Header */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isTagLoading ? (
              <span className="inline-block w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
            ) : (
              <>Posts tagged: {tagData?.name || tag}</>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse all articles related to this topic
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      <TagFilter selectedTag={tag} />

      {/* Blog Posts */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : posts?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                There are no posts matching the selected tag: <span className="font-medium">{tagData?.name || tag}</span>
              </p>
              <Link href="/posts">
                <Button>
                  Show all posts
                </Button>
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
