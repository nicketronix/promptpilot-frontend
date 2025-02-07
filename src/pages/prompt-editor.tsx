import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Prompt } from "@shared/schema";
import { Sparkles, ThumbsDown, ThumbsUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptResponse extends Prompt {
  suggestions: string[];
}

export default function PromptEditor() {
  const { toast } = useToast();
  const [promptText, setPromptText] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState<PromptResponse | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/prompts", { originalText: text });
      return res.json();
    },
    onSuccess: (prompt: PromptResponse) => {
      setCurrentPrompt(prompt);
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze prompt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ promptId, isHelpful }: { promptId: number; isHelpful: boolean }) => {
      const res = await apiRequest("POST", `/api/prompts/${promptId}/feedback`, {
        isHelpful,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thanks for your feedback!",
        description: "Your input helps us improve our suggestions.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Write Your Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button
                    onClick={() => analyzeMutation.mutate(promptText)}
                    disabled={!promptText || analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Analyze Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Analysis & Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {currentPrompt ? (
                  <div className="space-y-6">
                    {currentPrompt.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Suggestions:</h3>
                        <ul className="list-disc pl-4 space-y-1">
                          {currentPrompt.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-primary/5">
                      <h3 className="font-semibold mb-2">Enhanced Version:</h3>
                      <p className="whitespace-pre-wrap">{currentPrompt.enhancedText}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Quality Score: {currentPrompt.qualityScore}/100
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            feedbackMutation.mutate({
                              promptId: currentPrompt.id,
                              isHelpful: true,
                            })
                          }
                          disabled={feedbackMutation.isPending}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Helpful
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            feedbackMutation.mutate({
                              promptId: currentPrompt.id,
                              isHelpful: false,
                            })
                          }
                          disabled={feedbackMutation.isPending}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Not Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a prompt and click analyze to get AI-powered suggestions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}