import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "@/hooks/use-theme";
import { Menu, Search, Moon, Sun, X } from "lucide-react";
import SearchDialog from "@/components/blog/search-dialog";

export default function Navbar() {
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <Link href="/">
              <a className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                DevBlog
              </a>
            </Link>
            <nav className="hidden md:flex ml-8 space-x-6">
              <Link href="/">
                <a className="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium">
                  Home
                </a>
              </Link>
              <Link href="/posts">
                <a className="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium">
                  All Posts
                </a>
              </Link>
              <Link href="/tags/next-js">
                <a className="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium">
                  Categories
                </a>
              </Link>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium"
              >
                About
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button className="hidden sm:flex">Subscribe</Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Link href="/">
                  <a className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    DevBlog
                  </a>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="space-y-4">
                <Link href="/">
                  <a 
                    className="block py-2 text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                </Link>
                <Link href="/posts">
                  <a 
                    className="block py-2 text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Posts
                  </a>
                </Link>
                <Link href="/tags/next-js">
                  <a 
                    className="block py-2 text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </a>
                </Link>
                <a 
                  href="#" 
                  className="block py-2 text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Popular Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "React", "MDX", "Tailwind CSS", "Dark Mode", "CSS"].map((tag) => (
                    <Link 
                      key={tag} 
                      href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}`}
                    >
                      <a 
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {tag}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
