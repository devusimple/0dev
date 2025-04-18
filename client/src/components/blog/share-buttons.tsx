import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Mail, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  slug: string;
  large?: boolean;
  className?: string;
}

export default function ShareButtons({ title, slug, large = false, className }: ShareButtonsProps) {
  const { toast } = useToast();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/posts/${slug}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "The article link has been copied to your clipboard",
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      });
    });
  };

  if (large) {
    return (
      <div className={cn("flex flex-wrap gap-3", className)}>
        <Button
          className="bg-[#1DA1F2] text-white hover:bg-[#1a96db]"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")}
        >
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </Button>
        <Button
          className="bg-[#4267B2] text-white hover:bg-[#365899]"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")}
        >
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </Button>
        <Button
          className="bg-[#0A66C2] text-white hover:bg-[#0959ab]"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </Button>
        <Button
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`, "_blank")}
        >
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex-none", className)}>
      <div className="w-10 space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")}
          aria-label="Share on Twitter"
        >
          <Twitter className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")}
          aria-label="Share on Facebook"
        >
          <Facebook className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          <LinkIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
