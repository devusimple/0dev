import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface FeaturedPostProps {
  post: {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    readingTime: string;
    coverImage?: string;
    tags: Array<{ id: number; name: string; slug: string }>;
  };
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <div className="grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3 relative overflow-hidden rounded-xl shadow-lg">
        <img
          src={post.coverImage || "https://via.placeholder.com/1200x600"}
          alt={post.title}
          className="w-full h-80 md:h-full object-cover transform hover:scale-105 transition duration-500"
        />
      </div>
      <div className="md:col-span-2 flex flex-col justify-center">
        <div className="space-x-2 mb-4">
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <a>
                <Badge
                  className={`inline-block px-3 py-1 text-xs font-medium ${
                    tag.name === "Next.js" || tag.name === "React"
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300"
                  }`}
                >
                  {tag.name}
                </Badge>
              </a>
            </Link>
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="mx-2">•</span>
          <span>{post.readingTime}</span>
        </div>
        <Link href={`/posts/${post.slug}`}>
          <a className="inline-flex items-center font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Read full article
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
    </div>
  );
}
