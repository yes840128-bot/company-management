# Vercel 환경 변수 설정 가이드 (필수!)

## ⚠️ 중요: 환경 변수 설정이 필수입니다

현재 오류는 **Vercel에 DATABASE_URL 환경 변수가 설정되지 않았거나 잘못 설정되었기 때문**입니다.

## 🔧 설정 방법 (단계별)

### 1단계: Supabase에서 연결 풀 URL 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **연결 문자열 찾기**
   - 왼쪽 메뉴: **Settings** (⚙️ 아이콘)
   - **Database** 클릭
   - 아래로 스크롤하여 **Connection string** 섹션 찾기

3. **Connection pooling 탭 선택**
   - **Connection pooling** 탭 클릭 (중요!)
   - **Transaction mode** 선택 (서버리스 환경에 최적화)
   - 연결 문자열 복사
   - 형식: `postgres://postgres.[프로젝트-참조]:[비밀번호]@aws-0-[지역].pooler.supabase.com:6543/postgres?pgbouncer=true`

### 2단계: Vercel에 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 **company-management** 선택

2. **환경 변수 설정**
   - 상단 메뉴: **Settings** 클릭
   - 왼쪽 사이드바: **Environment Variables** 클릭

3. **새 환경 변수 추가**
   - **Name**: `DATABASE_URL`
   - **Value**: Supabase에서 복사한 연결 풀 URL 붙여넣기
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - 모두 체크!

4. **저장**
   - **Save** 버튼 클릭

### 3단계: 재배포

환경 변수를 저장하면 자동으로 재배포가 시작됩니다.

또는 수동으로:
- **Deployments** 탭으로 이동
- 최신 배포 선택
- **Redeploy** 클릭

## ✅ 확인 방법

1. **배포 완료 확인**
   - Deployments 탭에서 최신 배포가 성공했는지 확인
   - Status가 "Ready"인지 확인

2. **접속 테스트**
   - https://company-management-7pqi.vercel.app/companies 접속
   - 오류 없이 페이지가 로드되면 성공!

## 🔍 문제 해결

### 여전히 오류가 발생하는 경우

1. **환경 변수 확인**
   - Vercel 대시보드에서 `DATABASE_URL`이 정확히 설정되었는지 확인
   - 연결 풀 URL인지 확인 (pooler.supabase.com 포함)

2. **Supabase 프로젝트 확인**
   - Supabase 프로젝트가 활성화되어 있는지 확인
   - 데이터베이스가 실행 중인지 확인

3. **Vercel 로그 확인**
   - Vercel 대시보드 > 프로젝트 > **Functions** 탭
   - 최신 함수 실행 로그 확인
   - 에러 메시지 확인

4. **연결 풀 URL 형식 확인**
   ```
   ✅ 올바른 형식: postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true
   ❌ 잘못된 형식: postgres://...@db.xxx.supabase.co:5432/...
   ```

## 📝 참고

- **직접 연결 URL (5432 포트)**: 서버리스 환경에서 작동하지 않음
- **연결 풀 URL (6543 포트)**: 서버리스 환경에 필수
- 환경 변수 설정 후 **반드시 재배포** 필요

## 🆘 도움이 필요한 경우

환경 변수를 설정했는데도 오류가 계속되면:
1. Vercel Functions 로그 확인
2. Supabase 대시보드에서 데이터베이스 상태 확인
3. 연결 풀 URL이 정확한지 다시 확인


