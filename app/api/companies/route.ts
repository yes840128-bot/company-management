// 업체 목록 조회 및 생성 API
import { NextRequest, NextResponse } from 'next/server';
import { getAllCompanies, createCompany } from '@/lib/data';
import { Company } from '@/types/company';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { callClovaOcr } from '@/lib/clovaOcr';

// Node.js runtime 사용 (파일 시스템 및 OCR 처리에 필요)
export const runtime = 'nodejs';

// GET: 모든 업체 조회
export async function GET() {
  try {
    // 환경 변수 확인
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.trim() === '') {
      return NextResponse.json(
        { 
          error: '데이터베이스 연결 설정이 필요합니다. ' +
                 'Vercel 대시보드 > Settings > Environment Variables에서 DATABASE_URL을 설정하세요. ' +
                 'Supabase 연결 풀 URL 형식: postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true'
        },
        { status: 500 }
      );
    }

    const companies = await getAllCompanies();
    return NextResponse.json(companies || []);
  } catch (error) {
    console.error('❌ GET /api/companies Error:', error);
    const errorMessage = error instanceof Error ? error.message : '업체 목록을 불러오는데 실패했습니다.';
    
    // 데이터베이스 연결 오류인 경우 더 자세한 안내 제공
    let userFriendlyMessage = errorMessage;
    
    if (errorMessage.includes("DATABASE_URL") || errorMessage.includes("환경 변수")) {
      // 환경 변수 관련 오류는 이미 처리됨
      userFriendlyMessage = errorMessage;
    } else if (errorMessage.includes("Can't reach database server") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("timeout")) {
      const dbUrl = process.env.DATABASE_URL || '';
      const isSupabase = dbUrl.includes('supabase');
      const isPooler = dbUrl.includes('pooler') || dbUrl.includes('pgbouncer');
      
      if (isSupabase && !isPooler) {
        userFriendlyMessage = 
          '데이터베이스 연결 오류가 발생했습니다. ' +
          'Supabase를 사용하는 경우 연결 풀(Connection Pool) URL을 사용해야 합니다. ' +
          'Supabase 대시보드 > Settings > Database > Connection string > Connection pooling (Transaction mode)에서 연결 풀 URL을 복사하여 ' +
          'Vercel 환경 변수 DATABASE_URL에 설정하세요. ' +
          '형식: postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true';
      } else {
        userFriendlyMessage = 
          '데이터베이스 서버에 연결할 수 없습니다. ' +
          'DATABASE_URL 환경 변수가 올바르게 설정되었는지 확인하세요. ' +
          '데이터베이스 서버가 실행 중인지 확인하세요.';
      }
    }
    
    return NextResponse.json(
      { error: userFriendlyMessage },
      { status: 500 }
    );
  }
}

// POST: 새 업체 생성
export async function POST(request: NextRequest) {
  try {
    // FormData 읽기
    const form = await request.formData();

    // 1) 회사 데이터 구성 (필드명은 실제 모델에 맞게 수정)
    const companyData = {
      companyName: form.get('companyName') as string,
      businessNumber: form.get('businessNumber') as string,
      representativeName: form.get('representativeName') as string,
      address: (form.get('address') as string) || '',
      businessType: (form.get('businessType') as string) || '',
      businessItem: (form.get('businessItem') as string) || '',
      creditRating: (form.get('creditRating') as string) || '',
      riskRating: (form.get('riskRating') as string) || '',
      memo: (form.get('memo') as string) || '',
      establishedAt: form.get('establishedAt')
        ? (form.get('establishedAt') as string)
        : null,
      loanStatus: (form.get('loanStatus') as string) || '',
      businessLicensePath: (form.get('businessLicensePath') as string) || null,
    };

    const file = form.get('file') as unknown as File | null;
    const fileType = (form.get('fileType') as string) || 'business_license';

    // 2) 회사 생성
    const newCompany = await createCompany(companyData);

    // 3) 파일이 있으면 서버에 저장 + File 레코드 생성
    // 파일 저장 실패해도 회사 생성은 성공으로 처리
    if (file) {
      try {
        // ==== 여기 안에서만 파일 저장 / File 레코드 생성 ====
        // fileType에 따라 DB에 저장할 타입 결정
        let dbFileType = '';
        if (fileType === 'business_license' || fileType === 'businessLicense' || fileType === 'biz_license') {
          dbFileType = 'business_license';
        } else if (fileType === 'biz_license_text' || fileType === 'business_license_text') {
          dbFileType = 'business_license';
        } else if (fileType === 'credit') {
          dbFileType = 'credit';
        } else if (fileType === 'call_recording' || fileType === 'callRecording') {
          dbFileType = 'call_recording';
        } else {
          dbFileType = fileType || 'other';
        }

        // 텍스트 파일인지 확인
        const isTextFile = fileType === 'biz_license_text' || fileType === 'business_license_text';

        // 파일을 바이트 배열로 변환 (텍스트 파일은 나중에 처리)
        let buffer: Buffer;
        let extractedText: string | null = null;

        if (isTextFile) {
          // 텍스트 파일인 경우 직접 읽기
          extractedText = await file.text();
          // 텍스트를 Buffer로 변환하여 저장
          buffer = Buffer.from(extractedText, 'utf-8');
        } else {
          // 이미지 파일인 경우 Buffer로 변환
          const arrayBuffer = await file.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        }

        // 저장 경로: public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // 업로드 폴더가 없으면 생성
        await fs.mkdir(uploadDir, { recursive: true });

        // 원본 파일명
        const originalName = file.name || 'uploaded';

        // 확장자 추출
        const ext = path.extname(originalName); // 예: '.pdf', '.jpg'

        // UUID로 저장 파일명 생성
        const storedName = `${randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, storedName);

        // 파일을 서버에 저장
        await fs.writeFile(filePath, buffer);

        // 텍스트 추출 처리 (사업자등록증 이미지 파일인 경우 OCR 처리)
        if (dbFileType === 'business_license' && !isTextFile) {
          try {
            // 이미지 파일인 경우 OCR 처리
            extractedText = await callClovaOcr(buffer, file.name);
          } catch (error) {
            console.error('OCR 처리 실패:', error);
            // OCR 실패해도 파일 저장은 계속 진행
            extractedText = null;
          }
        }

        // DB에 파일 정보 저장
        // path는 웹에서 접근 가능한 경로 (예: /uploads/uuid.pdf)
        await prisma.file.create({
          data: {
            companyId: newCompany.id,
            fileName: originalName, // 기존 필드 (호환성 유지)
            fileType: dbFileType,
            filePath: `/uploads/${storedName}`, // 웹에서 접근 가능한 경로
            originalName: originalName, // 원본 파일명
            storedName: storedName, // 저장된 파일명 (UUID)
            extractedText: extractedText, // OCR 결과
            status: '사용중', // 상태
          },
        });
      } catch (fileError) {
        // 파일 저장이 실패해도 업체 생성은 성공으로 처리
        console.error('❌ Company File Save Error:', fileError);
        // 여기서 throw 하지 않음 - 회사 생성은 성공했으므로 201 응답 반환
      }
    }

    // 파일 저장 성공/실패와 관계없이, 회사 생성은 성공 응답
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('❌ Company Create Error:', error);
    return NextResponse.json(
      { error: '업체를 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}


