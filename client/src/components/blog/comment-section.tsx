import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, MessageCircle } from "lucide-react";

interface CommentSectionProps {
  postId: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  comment: z.string().min(5, { message: "Comment must be at least 5 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      content: "This is exactly what I needed! I've been struggling with setting up MDX in my Next.js project, and your guide made it so much clearer. Thank you!",
      date: "2 days ago",
      isAuthor: false,
      replies: [],
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      content: "Great article! One question though - have you found any performance issues when using a lot of custom MDX components? I'm building a documentation site and wondering if there are any optimizations I should consider.",
      date: "1 day ago",
      isAuthor: false,
      replies: [
        {
          id: 3,
          name: "Jane Doe",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
          content: "Thanks for the question, Michael! In my experience, performance only becomes an issue when you have dozens of complex components on a single page. For most documentation sites, you should be fine. I'll cover optimization strategies in a future article!",
          date: "12 hours ago",
          isAuthor: true,
        },
      ],
    },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      comment: "",
    },
  });

  function onSubmit(values: FormValues) {
    // In a real app, this would send the comment to the server
    const newComment = {
      id: comments.length + 1,
      name: values.name,
      avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(values.name),
      content: values.comment,
      date: "Just now",
      isAuthor: false,
      replies: [],
    };

    setComments([...comments, newComment]);
    form.reset();

    toast({
      title: "Comment submitted",
      description: "Your comment has been posted successfully.",
    });
  }

  return (
    <section className="mt-12 bg-gray-100 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Comments
          </h3>
          
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comment
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Post Comment
                </Button>
              </form>
            </Form>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
              {comments.map((comment) => (
                <div key={comment.id} className="mb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                      <img 
                        src={comment.avatar} 
                        alt={comment.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {comment.name}
                          {comment.isAuthor && (
                            <span className="text-primary-600 dark:text-primary-400 text-sm font-normal ml-1">
                              (Author)
                            </span>
                          )}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {comment.date}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                      <div className="mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Like
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Nested replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-14">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                            <img 
                              src={reply.avatar} 
                              alt={reply.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {reply.name}
                                {reply.isAuthor && (
                                  <span className="text-primary-600 dark:text-primary-400 text-sm font-normal ml-1">
                                    (Author)
                                  </span>
                                )}
                              </h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {reply.date}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>
                            <div className="mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Like
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
