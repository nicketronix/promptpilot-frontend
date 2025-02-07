import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Prompt } from "@shared/schema";
import { Sparkles, History, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: prompts } = useQuery<Prompt[]>({ queryKey: ["/api/prompts"] });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PromptPilot
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {user?.username}</span>
            <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <section className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get real-time suggestions and improvements for your AI prompts
                </p>
                <Link href="/editor">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Writing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prompts?.length === 0 ? (
                  <p className="text-muted-foreground">No prompts yet. Create your first one!</p>
                ) : (
                  <div className="space-y-4">
                    {prompts?.slice(0, 3).map((prompt) => (
                      <div key={prompt.id} className="p-4 rounded-lg border">
                        <p className="font-medium">{prompt.originalText}</p>
                        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                          <span>Quality Score: {prompt.qualityScore}</span>
                          <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
