"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface ComparisonResult {
  match: boolean;
  confidence: number;
  explanation: string;
  error?: string;
}

export default function Home() {
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/compare-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address1, address2 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare addresses");
      }

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <MapPin className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Address Comparison
          </h1>
          <p className="mt-2 text-gray-600">
            Compare two addresses to check if they refer to the same location
          </p>
        </div>

        <Card className="p-6 bg-white shadow-lg rounded-lg">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Address
              </label>
              <Input
                id="address1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Enter first address"
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Second Address
              </label>
              <Input
                id="address2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Enter second address"
                className="w-full"
              />
            </div>

            <Button
              onClick={compareAddresses}
              disabled={loading || !address1 || !address2}
              className="w-full"
            >
              {loading ? "Comparing..." : "Compare Addresses"}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}
          </div>

          {result && !error && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Match:</span>{" "}
                  <span
                    className={result.match ? "text-green-600" : "text-red-600"}
                  >
                    {result.match ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Confidence:</span>{" "}
                  {(result.confidence * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="font-medium">Explanation:</span>{" "}
                  {result.explanation}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
