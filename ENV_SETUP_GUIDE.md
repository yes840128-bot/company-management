# 환경 변수 설정 완벽 가이드

## 🚨 현재 오류 해결 방법

데이터베이스 연결 오류가 발생하는 경우, 다음 단계를 따라 설정하세요.

## 📋 단계별 설정 방법

### 1단계: Supabase에서 연결 풀 URL 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 로그인 후 프로젝트 선택

2. **Database 설정으로 이동**
   - 왼쪽 메뉴에서 **Settings** 클릭
   - **Database** 섹션 선택

3. **Connection string 찾기**
   - **Connection string** 섹션으로 스크롤
   - **Connection pooling** 탭 클릭 (중요!)
   - **Transaction mode** 선택 (서버리스 환경에 최적화)

4. **연결 문자열 복사**
   - 표시된 연결 문자열을 전체 복사
   - 형식 예시: `postgres://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`

### 2단계: Vercel에 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 로그인 후 프로젝트 `company-management` 선택

2. **Environment Variables로 이동**
   - 상단 메뉴에서 **Settings** 클릭
   - 왼쪽 사이드바에서 **Environment Variables** 선택

3. **환경 변수 추가/수정**
   - **Key**: `DATABASE_URL`
   - **Value**: Supabase에서 복사한 연결 풀 URL 붙여넣기
   - **Environment**: 다음 모두 선택
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

4. **저장**
   - **Save** 버튼 클릭
   - 환경 변수가 저장되면 자동으로 재배포가 시작됩니다

### 3단계: 배포 확인

1. **Deployments 탭 확인**
   - Vercel 대시보드에서 **Deployments** 탭 클릭
   - 최신 배포가 **Ready** 상태가 될 때까지 대기 (약 1-2분)

2. **접속 테스트**
   - https://company-management-7pqi.vercel.app/companies 접속
   - 오류 없이 페이지가 로드되면 성공!

## ✅ 확인 사항

### 올바른 연결 풀 URL 형식
```
postgres://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 잘못된 직접 연결 URL (사용하지 않음)
```
postgres://postgres.xxx:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 차이점
- ✅ **연결 풀 URL**: `pooler.supabase.com:6543` + `?pgbouncer=true` 포함
- ❌ **직접 연결 URL**: `db.xxx.supabase.co:5432` (서버리스 환경에서 작동하지 않음)

## 🔍 문제 해결

### 여전히 오류가 발생하는 경우

1. **환경 변수 확인**
   - Vercel 대시보드에서 DATABASE_URL이 올바르게 설정되었는지 확인
   - 연결 풀 URL인지 확인 (pooler.supabase.com 포함)

2. **Supabase 프로젝트 상태 확인**
   - Supabase 대시보드에서 프로젝트가 활성화되어 있는지 확인
   - Database가 실행 중인지 확인

3. **재배포**
   - 환경 변수 수정 후 수동으로 재배포:
     - Deployments 탭 → 최신 배포 → ... 메뉴 → Redeploy

4. **로그 확인**
   - Vercel 대시보드 → 프로젝트 → Functions 탭
   - 에러 로그 확인

## 📞 추가 도움

문제가 계속되면 다음을 확인하세요:
- Supabase 프로젝트가 일시 중지되지 않았는지
- 연결 풀 URL의 비밀번호가 올바른지
- Vercel 환경 변수가 모든 환경(Production, Preview, Development)에 설정되었는지

