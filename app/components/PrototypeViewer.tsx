'use client';

import { useState, useEffect } from 'react';

interface PrototypeViewerProps {
  prototypePath: string;
}

export default function PrototypeViewer({ prototypePath }: PrototypeViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrototype = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/files?path=${encodeURIComponent(prototypePath)}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setHtmlContent(data.content);
        }
      } catch (err) {
        setError('Failed to load prototype');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (prototypePath) {
      loadPrototype();
    }
  }, [prototypePath]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading prototype...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900">
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Prototype Preview"
      />
    </div>
  );
}

