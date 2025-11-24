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
    try {
      // URL 파싱
      const urlObj = new URL(url);
      
      // 호스트를 pooler로 변경
      const hostname = urlObj.hostname;
      const poolerHostname = hostname.replace('db.', 'pooler.');
      
      // 포트를 6543으로 변경 (연결 풀 포트)
      urlObj.hostname = poolerHostname;
      urlObj.port = '6543';
      
      // 쿼리 파라미터 추가
      urlObj.searchParams.set('pgbouncer', 'true');
      urlObj.searchParams.set('connection_limit', '1');
      
      const poolerUrl = urlObj.toString();
      console.log('🔄 Converted Supabase direct connection to connection pool URL');
      return poolerUrl;
    } catch (error) {
      // URL 파싱 실패 시 간단한 문자열 치환 사용
      console.warn('⚠️ URL parsing failed, using string replacement');
      const poolerUrl = url
        .replace('@db.', '@pooler.')
        .replace(':5432/', ':6543/')
        .replace(/:5432$/, ':6543')
        .replace(/\?.*$/, '') // 기존 쿼리 파라미터 제거
        .concat('?pgbouncer=true&connection_limit=1');
      
      console.log('🔄 Converted Supabase URL to connection pool URL (fallback)');
      return poolerUrl;
    }
  }
  
  return url;
}

/**
 * 환경 변수 검증 및 데이터베이스 연결 준비
 */
export function validateDatabaseConfig(): { isValid: boolean; message: string } {
  const url = process.env.DATABASE_URL;
  
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      message: 'DATABASE_URL 환경 변수가 설정되지 않았습니다. Vercel 대시보드 > Settings > Environment Variables에서 DATABASE_URL을 설정하세요.'
    };
  }
  
  // 유효한 PostgreSQL URL 형식인지 확인
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    return {
      isValid: false,
      message: 'DATABASE_URL이 올바른 PostgreSQL 연결 문자열 형식이 아닙니다. postgres:// 또는 postgresql://로 시작해야 합니다.'
    };
  }
  
  // Supabase 사용 시 연결 풀 URL 사용 권장
  if (url.includes('supabase.co') && !url.includes('pooler') && !url.includes('pgbouncer')) {
    return {
      isValid: true,
      message: '⚠️ 경고: Supabase 직접 연결을 사용하고 있습니다. 서버리스 환경(Vercel)에서는 연결 풀 URL을 사용하는 것이 권장됩니다. Supabase 대시보드 > Settings > Database > Connection string > Connection pooling에서 연결 풀 URL을 가져오세요.'
    };
  }
  
  return { isValid: true, message: '환경 변수가 올바르게 설정되었습니다.' };
}

