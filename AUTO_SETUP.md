# 🚀 자동 설정 가이드 (5분이면 완료!)

## ⚡ 가장 빠른 방법

### 1단계: Neon 계정 생성 (1분)
1. https://neon.tech 접속
2. **Sign up** → **Continue with GitHub** 클릭
3. GitHub 권한 승인
4. 완료!

### 2단계: 프로젝트 생성 (30초)
1. Neon 대시보드에서 **Create Project** 클릭
2. **Project name**: `company-management`
3. **Region**: `Seoul (ap-northeast-2)` 선택
4. **Create Project** 클릭

### 3단계: 연결 문자열 복사 (30초)
1. 프로젝트 대시보드가 열리면
2. **Connection string** 섹션에서 **Copy** 버튼 클릭
3. 연결 문자열이 클립보드에 복사됨

### 4단계: 자동 설정 실행 (1분)
프로젝트 루트 폴더에서 PowerShell 실행:

```powershell
npm run setup:neon
```

스크립트가 연결 문자열을 요청하면:
- 위에서 복사한 연결 문자열을 **붙여넣기** (Ctrl+V)
- Enter 키 누르기

### 5단계: 완료! (자동)
- ✅ 자동으로 Vercel에 환경 변수 설정
- ✅ 자동 재배포 시작
- ✅ 약 1-2분 후 정상 작동!

## 🔗 접속 확인

배포 완료 후 (약 1-2분):
**https://company-management-7pqi.vercel.app/companies**

정상 작동하면 업체 목록 페이지가 표시됩니다!

## ✅ 테스트

로컬에서 데이터베이스 연결 테스트:
```bash
npm run test:db
```

## 🆘 문제 해결

### 스크립트 실행 오류
- Vercel CLI 설치: `npm install -g vercel`
- Vercel 로그인: `vercel login`

### 환경 변수 설정 실패
- Vercel 대시보드에서 수동 설정:
  1. https://vercel.com/dashboard
  2. 프로젝트 선택 > Settings > Environment Variables
  3. DATABASE_URL 추가 (Neon 연결 문자열)

### 여전히 오류 발생
- Vercel 대시보드 > Deployments에서 최신 배포 확인
- Functions 탭에서 로그 확인

## 📝 요약

1. Neon 계정 생성 (무료)
2. 프로젝트 생성
3. 연결 문자열 복사
4. `npm run setup:neon` 실행
5. 완료!

**총 소요 시간: 약 5분**

