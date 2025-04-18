import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PostCard from "@/components/blog/post-card";

interface RelatedPostsProps {
  currentPostId: number;
  tags: number[];
}

export default function RelatedPosts({ currentPostId, tags }: RelatedPostsProps) {
  // Fetch all posts to filter related ones
  const { data, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!data?.posts || data.posts.length <= 1) {
    return null;
  }

  // Filter out current post and find posts with matching tags
  const relatedPosts = data.posts
    .filter((post) => post.id !== currentPostId)
    .filter((post) => {
      const postTagIds = post.tags.map((tag) => tag.id);
      return tags.some((tagId) => postTagIds.includes(tagId));
    })
    .slice(0, 2); // Limit to 2 related posts

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 bg-white dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Related Articles
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {relatedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <a className="flex flex-col p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-auto line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="text-primary-600 dark:text-primary-400 text-sm mt-4">
                    Read article →
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
