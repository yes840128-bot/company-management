# Supabase 연결 풀 설정 가이드

## 문제 해결

Vercel과 같은 서버리스 환경에서는 Supabase의 **연결 풀(Connection Pool)** URL을 사용해야 합니다.

## 설정 방법

### 1. Supabase 대시보드에서 연결 풀 URL 가져오기

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** > **Database** 이동
4. **Connection string** 섹션에서 **Connection pooling** 탭 선택
5. **Transaction mode** 또는 **Session mode** 중 하나 선택
   - **Transaction mode** (권장): 서버리스 환경에 최적화
   - **Session mode**: 일반적인 애플리케이션에 적합
6. 연결 문자열 복사 (예: `postgres://...@pooler.supabase.com:6543/...?pgbouncer=true`)

### 2. Vercel 환경 변수 설정

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택: **company-management**
3. **Settings** > **Environment Variables** 이동
4. 다음 환경 변수 추가/수정:
   - **Name**: `DATABASE_URL`
   - **Value**: Supabase에서 복사한 연결 풀 URL
   - **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭

### 3. 재배포

환경 변수를 설정한 후:
1. Vercel 대시보드에서 **Deployments** 탭으로 이동
2. 최신 배포를 선택하고 **Redeploy** 클릭
   또는
3. GitHub에 푸시하면 자동으로 재배포됩니다

## 연결 풀 URL 형식

### 직접 연결 URL (사용하지 않음)
```
postgres://user:pass@db.xxx.supabase.co:5432/dbname
```

### 연결 풀 URL (사용해야 함)
```
postgres://user:pass@pooler.xxx.supabase.co:6543/dbname?pgbouncer=true&connection_limit=1
```

## 차이점

- **직접 연결 (5432 포트)**: 서버리스 환경에서 연결 제한으로 인해 오류 발생 가능
- **연결 풀 (6543 포트)**: 서버리스 환경에 최적화, 여러 요청을 효율적으로 처리

## 확인 방법

환경 변수 설정 후 배포가 완료되면:
1. https://company-management-7pqi.vercel.app/companies 접속
2. 정상적으로 업체 목록이 표시되면 성공!

## 문제가 계속되는 경우

1. 환경 변수가 제대로 설정되었는지 확인
2. 연결 풀 URL이 올바른지 확인 (pooler.supabase.com 포함)
3. Supabase 프로젝트가 활성화되어 있는지 확인
4. Vercel 로그 확인: Vercel 대시보드 > 프로젝트 > Functions 탭

