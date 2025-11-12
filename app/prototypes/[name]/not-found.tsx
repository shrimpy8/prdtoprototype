export default function NotFound() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Prototype Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The prototype you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}

