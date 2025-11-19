// app/api/companies/preview-from-file/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callClovaOcr } from '@/lib/clovaOcr';
import { parseBusinessLicenseText } from '@/lib/parseBusinessLicense';

export const runtime = 'nodejs';

// 사업자등록증 / 텍스트 파일에서 업체 정보 추출
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = (formData.get('fileType') as string) ?? 'biz_license';

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 },
      );
    }

    let rawText = '';

    // 👉 텍스트 파일이면: 파일 안의 글자를 그대로 읽기
    if (
      fileType === 'biz_license_text' ||
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.txt')
    ) {
      rawText = await file.text();
    }
    // 👉 그 외(이미지)는: 기존처럼 CLOVA OCR 사용
    else {
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      rawText = await callClovaOcr(imageBuffer, file.name);
    }

    // 기존 파서 그대로 사용
    const parsed = parseBusinessLicenseText(rawText);

    return NextResponse.json(
      {
        rawText,
        parsed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ preview-from-file API Error:', error);
    return NextResponse.json(
      { error: '업체 정보를 불러오는 데 실패했습니다.' },
      { status: 500 },
    );
  }
}
