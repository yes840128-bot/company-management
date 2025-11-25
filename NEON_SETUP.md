# 🆓 Neon 무료 데이터베이스 설정 (가장 쉬운 방법!)

## ✅ Neon의 장점

- **완전 무료** - 제한 없이 사용 가능
- **Vercel과 완벽 호환** - 추가 설정 불필요
- **연결 풀 자동 제공** - Supabase처럼 별도 설정 불필요
- **빠른 설정** - 2분이면 완료

## 🚀 설정 방법 (2분)

### 1단계: Neon 계정 생성

1. https://neon.tech 접속
2. **Sign up** 클릭
3. **GitHub로 가입** (가장 빠름)
4. 무료 계정 생성 완료

### 2단계: 프로젝트 생성

1. Neon 대시보드에서 **Create Project** 클릭
2. 프로젝트 이름 입력 (예: `company-management`)
3. **Region**: `Seoul (ap-northeast-2)` 선택 (한국에서 가장 빠름)
4. **Create Project** 클릭

### 3단계: 연결 문자열 가져오기

1. 프로젝트 대시보드에서 **Connection string** 섹션 찾기
2. **Connection string** 클릭
3. 연결 문자열 복사
   - 형식: `postgres://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require`

### 4단계: 자동 설정

프로젝트 루트에서 실행:
```bash
node setup-neon.js
```

스크립트가 연결 문자열을 요청하면 위에서 복사한 문자열을 붙여넣으세요.

### 5단계: 완료!

- 자동으로 Vercel에 환경 변수 설정
- 자동 재배포 시작
- 약 1-2분 후 정상 작동!

## 🔗 접속

배포 완료 후:
- https://company-management-7pqi.vercel.app/companies

## ✅ 장점 비교

| 항목 | Supabase | Neon |
|------|----------|------|
| 무료 | ✅ | ✅ |
| 연결 풀 설정 | 복잡 | 자동 |
| Vercel 호환 | 설정 필요 | 완벽 |
| 설정 시간 | 5분 | 2분 |

**Neon이 더 쉽고 빠릅니다!**

