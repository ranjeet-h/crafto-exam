"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Quote {
  id: number;
  username: string;
  text: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotesPage() {

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);


  const router = useRouter();

  useEffect(() => {
    const fetchQuotes = async () => {
      if (isLoading) return; // Prevent concurrent requests
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const limit = 10;
        const offset = (page - 1) * limit;
        const response = await fetch(`https://assignment.stage.crafto.app/getQuotes?limit=${limit}&offset=${offset}`, {
          headers: {
            'Authorization': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const data = await response.json();
        if (data.data.length < limit) {
          setHasMore(false);
        }
        setQuotes((prevQuotes) => [...prevQuotes, ...data.data]);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quotes && quotes.map((quote) => (
          <Card key={quote.id} className="overflow-hidden  border-gray-900 shadow-2xl drop-shadow-xl">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={quote.mediaUrl || ""} 
                  alt={`Quote by ${quote.username}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <div className="absolute inset-0 left-[45%] top-[17%] flex items-center justify-center p-4 rounded-lg">
                  <p className=" text-lg font-semibold text-center">
                    {quote.text}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground">{quote.username}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {hasMore && (
        <Button
          onClick={() => setPage((prevPage) => prevPage + 1)}
          className="mt-4 mx-auto block"
        >
          Load More
        </Button>
      )}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12"
        onClick={() => router.push("/quotes/create")}
        variant={"destructive"}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}