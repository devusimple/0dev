import { Link } from "wouter";
import { cn } from "@/lib/utils";
import CodeBlock from "./code-block";

// Custom components for rendering MDX content
const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mt-10 mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mt-10 mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mt-8 mb-3 text-xl font-bold text-gray-900 dark:text-white",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "mt-6 mb-2 text-lg font-bold text-gray-900 dark:text-white",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "leading-7 mb-4 text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, href = "#", ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // If it's an internal link, use wouter's Link component
    if (href.startsWith("/")) {
      return (
        <Link href={href}>
          <a
            className={cn(
              "font-medium text-primary-600 dark:text-primary-400 hover:underline",
              className
            )}
            {...props}
          />
        </Link>
      );
    }
    
    // External link
    return (
      <a
        className={cn(
          "font-medium text-primary-600 dark:text-primary-400 hover:underline",
          className
        )}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        "my-6 ml-6 list-disc text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        "my-6 ml-6 list-decimal text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      className={cn(
        "mt-2 text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "mt-6 border-l-4 border-primary-500 pl-6 italic text-gray-800 dark:text-gray-200",
        className
      )}
      {...props}
    />
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line
    <img
      className={cn(
        "rounded-md my-6",
        className
      )}
      alt={alt}
      {...props}
    />
  ),
  hr: ({ ...props }) => (
    <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table
        className={cn(
          "w-full caption-bottom text-sm",
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 data-[state=selected]:bg-gray-50 dark:data-[state=selected]:bg-gray-800",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    // Extract code content and language from pre > code setup
    const rawChildren = props.children as React.ReactElement;
    
    if (rawChildren && rawChildren.type === 'code') {
      const { className: codeClassName, children } = rawChildren.props;
      const language = codeClassName ? codeClassName.replace('language-', '') : 'text';
      
      return (
        <CodeBlock
          code={children as string}
          language={language}
          className={className}
        />
      );
    }
    
    return (
      <pre
        className={cn(
          "my-6 overflow-x-auto rounded-lg bg-gray-800 dark:bg-gray-900 p-4 text-sm text-gray-200",
          className
        )}
        {...props}
      />
    );
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Handle inline code (not inside a pre)
    const isInline = !className?.includes('language-');
    
    if (isInline) {
      return (
        <code
          className={cn(
            "relative rounded bg-gray-100 dark:bg-gray-800 px-[0.3rem] py-[0.15rem] font-mono text-sm text-gray-900 dark:text-gray-300",
            className
          )}
          {...props}
        />
      );
    }
    
    // For code blocks inside pre, this is handled in the pre component
    return (
      <code
        className={cn(
          "text-gray-200 font-mono",
          className
        )}
        {...props}
      />
    );
  },
};

export default components;
