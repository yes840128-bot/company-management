// 데이터베이스 연결 유틸리티 함수

/**
 * Supabase 연결 URL을 서버리스 환경에 맞게 변환
 * Vercel과 같은 서버리스 환경에서는 연결 풀(Connection Pool)을 사용해야 합니다.
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // 이미 연결 풀 URL인 경우 그대로 반환
  if (url.includes('pooler.supabase.com') || url.includes('pgbouncer=true')) {
    return url;
  }
  
  // Supabase 직접 연결 URL을 연결 풀 URL로 변환
  if (url.includes('supabase.co') && url.includes('@db.')) {
    // 직접 연결: postgres://user:pass@db.xxx.supabase.co:5432/db
    // 연결 풀: postgres://user:pass@pooler.xxx.supabase.co:6543/db?pgbouncer=true
    const poolerUrl = url
      .replace('@db.', '@pooler.')
      .replace(':5432/', ':6543/')
      .replace(/\?.*$/, '') // 기존 쿼리 파라미터 제거
      .concat('?pgbouncer=true&connection_limit=1');
    
    console.log('🔄 Converted Supabase URL to connection pool URL');
    return poolerUrl;
  }
  
  return url;
}

/**
 * 환경 변수 검증 및 데이터베이스 연결 준비
 */
export function validateDatabaseConfig(): void {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it in Vercel dashboard: Settings > Environment Variables'
    );
  }
  
  // Supabase 사용 시 연결 풀 URL 사용 권장
  if (url.includes('supabase.co') && !url.includes('pooler') && !url.includes('pgbouncer')) {
    console.warn(
      '⚠️ Warning: Using direct Supabase connection. ' +
      'For serverless environments (Vercel), use connection pool URL instead. ' +
      'Get it from Supabase dashboard: Settings > Database > Connection string > Connection pooling'
    );
  }
}

