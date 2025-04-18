import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TagFilter({ selectedTag = null }: { selectedTag?: string | null }) {
  const [location] = useLocation();
  const [allTags, setAllTags] = useState<{ id: number; name: string; slug: string }[]>([]);
  
  const { data: tags, isLoading } = useQuery({
    queryKey: ["/api/tags"],
  });
  
  useEffect(() => {
    if (tags) {
      setAllTags(tags);
    }
  }, [tags]);
  
  if (isLoading) {
    return <div className="py-4 text-center">Loading tags...</div>;
  }
  
  return (
    <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center -mx-2">
          <div className="px-2 py-2">
            <span className="font-medium text-gray-900 dark:text-white">Filter by:</span>
          </div>
          <div className="flex-1 flex flex-wrap px-2">
            {allTags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <a>
                  <Button
                    variant={selectedTag === tag.slug ? "default" : "outline"}
                    size="sm"
                    className="m-1 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {tag.name}
                  </Button>
                </a>
              </Link>
            ))}
          </div>
          {selectedTag && (
            <div className="px-2 py-2">
              <Link href="/posts">
                <a className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <span>Clear filter</span>
                  <X className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
