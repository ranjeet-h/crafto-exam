'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateQuotePage() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      let mediaUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await fetch('https://crafto.app/crafto/v1.0/media/assignment/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData[0].url; 
      }

      const createResponse = await fetch('https://assignment.stage.crafto.app/postQuote', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mediaUrl,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create quote');
      }

      router.push('/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      setError('Failed to create quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Quote</CardTitle>
          <CardDescription>Add a new quote with an optional image</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your quote"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-image">Image (optional)</Label>
              <Input
                id="quote-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Quote'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}