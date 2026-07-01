import { TriangleAlert } from "lucide-react";

// src/views/PlaceholderPage.tsx
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6 text-center flex flex-col items-center justify-center gap-2 mt-40">
      <h1 className="text-xl font-semibold text-red-700 flex items-center gap-2">
       <TriangleAlert /> Resource <span className="font-bold">({title} Page)</span> Not Found
      </h1>
      <p className="text-sm opacity-60 mt-1 dark:text-white">This page (<span className="font-bold">{title}</span>)  hasn't been developed yet.</p>
    </div>
  );
}