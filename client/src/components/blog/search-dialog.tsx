import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Link } from "wouter";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fuse, setFuse] = useState<Fuse<any> | null>(null);

  const { data: posts } = useQuery({
    queryKey: ["/api/posts"],
    enabled: open,
  });

  useEffect(() => {
    if (posts?.posts?.length) {
      const options = {
        keys: ["title", "excerpt", "tags.name"],
        threshold: 0.3,
      };
      setFuse(new Fuse(posts.posts, options));
    }
  }, [posts]);

  useEffect(() => {
    if (fuse && searchQuery.length > 1) {
      const results = fuse.search(searchQuery);
      setSearchResults(results.map(result => result.item));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fuse]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset search when dialog closes
      setSearchQuery("");
      setSearchResults([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div className="flex items-center w-full">
            <Search className="text-gray-400 mr-3 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto p-2">
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Link key={result.id} href={`/posts/${result.slug}`}>
                  <a
                    className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onOpenChange(false)}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.excerpt.substring(0, 80)}...
                    </p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDate(result.publishedAt)}
                      </span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {result.readingTime}
                      </span>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
          {searchQuery.length > 1 && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}
          {searchQuery.length <= 1 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
