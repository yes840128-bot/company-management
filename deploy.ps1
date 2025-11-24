# Vercel 배포 스크립트
Write-Host "=== Vercel 배포 스크립트 ===" -ForegroundColor Green

# 1. 로그인 확인
Write-Host "`n1. Vercel 로그인 확인 중..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "로그인이 필요합니다. 브라우저에서 인증을 완료하세요." -ForegroundColor Red
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "로그인에 실패했습니다. 다시 시도하세요." -ForegroundColor Red
        exit 1
    }
}

# 2. Prisma 클라이언트 생성
Write-Host "`n2. Prisma 클라이언트 생성 중..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma 클라이언트 생성에 실패했습니다." -ForegroundColor Red
    exit 1
}

# 3. 배포
Write-Host "`n3. Vercel에 배포 중..." -ForegroundColor Yellow
vercel --prod --yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n배포가 완료되었습니다!" -ForegroundColor Green
    Write-Host "환경 변수 DATABASE_URL을 Vercel 대시보드에서 설정해주세요." -ForegroundColor Yellow
} else {
    Write-Host "`n배포에 실패했습니다. 오류를 확인하세요." -ForegroundColor Red
    exit 1
}


