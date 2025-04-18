import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
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
  className?: string;
}

export default function PostCard({ post, className }: PostCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg",
      className
    )}>
      <div className="h-48 overflow-hidden">
        <img
          src={post.coverImage || "https://via.placeholder.com/600x300"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <a>
                <Badge variant="secondary" className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  {tag.name}
                </Badge>
              </a>
            </Link>
          ))}
          {post.tags.length > 2 && (
            <Badge variant="secondary" className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              +{post.tags.length - 2}
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          <Link href={`/posts/${post.slug}`}>
            <a className="hover:text-primary-600 dark:hover:text-primary-400">
              {post.title}
            </a>
          </Link>
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>{post.readingTime}</span>
          </div>
          <Link href={`/posts/${post.slug}`}>
            <a className="text-primary-600 dark:text-primary-400 hover:underline">
              Read more
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
