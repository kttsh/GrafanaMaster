/**
 * 現在の実行環境が開発モードかどうかを判定する
 * @returns 開発モードの場合はtrue、それ以外はfalse
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * 環境変数を取得する（開発モード向けのフォールバック値を指定可能）
 * @param key 環境変数名
 * @param devFallback 開発モード時のフォールバック値
 * @returns 環境変数の値またはフォールバック値
 */
export function getEnvVariable(key: string, devFallback?: string): string | undefined {
  const value = process.env[key];
  
  if (value) return value;
  
  // 開発モードで環境変数が設定されていない場合はフォールバック値を返す
  if (isDevelopmentMode() && devFallback !== undefined) {
    return devFallback;
  }
  
  return undefined;
}

/**
 * ロギングユーティリティ
 * @param message メッセージ
 * @param level ログレベル
 */
export function logMessage(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  
  switch (level) {
    case 'info':
      console.log(`[${timestamp}] [INFO] ${message}`);
      break;
    case 'warn':
      console.warn(`[${timestamp}] [WARN] ${message}`);
      break;
    case 'error':
      console.error(`[${timestamp}] [ERROR] ${message}`);
      break;
  }
}

/**
 * 開発モード時のみ実行される関数
 * @param callback 開発モード時に実行するコールバック関数
 */
export function onlyInDevelopment(callback: () => void): void {
  if (isDevelopmentMode()) {
    callback();
  }
}

/**
 * 本番モード時のみ実行される関数
 * @param callback 本番モード時に実行するコールバック関数
 */
export function onlyInProduction(callback: () => void): void {
  if (!isDevelopmentMode()) {
    callback();
  }
}