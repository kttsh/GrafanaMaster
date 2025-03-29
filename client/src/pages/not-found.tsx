import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

/**
 * 404ページ
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-grafana-dark">
      <Card className="w-full max-w-md mx-4 bg-grafana-dark-200 border-grafana-dark-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <AlertCircle className="h-8 w-8 text-grafana-error mr-2" />
            <span className="text-2xl font-bold text-grafana-text">404 - ページが見つかりません</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-grafana-text mt-2">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </CardContent>
        
        <CardFooter>
          <Link href="/">
            <Button variant="default" className="bg-grafana-orange hover:bg-grafana-orange/90 text-white w-full">
              <Home className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
