import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * 404ページ
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-100">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
