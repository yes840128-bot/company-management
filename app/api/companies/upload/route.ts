// 파일 업로드 및 자동 채우기 API (예시 값)
import { NextRequest, NextResponse } from 'next/server';

// POST: 파일 업로드 처리 (현재는 예시 값 반환)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'businessLicense', 'credit', 'callRecording'
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }
    
    // 실제로는 여기서 파일을 분석하고 OCR/음성인식 등을 수행
    // 지금은 예시 값만 반환
    const exampleData = {
      companyName: '자동 입력된 업체명',
      businessNumber: '123-45-67890',
      representativeName: '자동 입력된 대표자명',
      address: '서울특별시 강남구 테헤란로 123',
      businessType: '도매 및 소매업',
      businessItem: '전자제품 판매',
      creditRating: 'A',
      riskRating: '낮음',
      memo: `${fileType} 파일에서 추출된 정보입니다.`,
    };
    
    // 파일 타입에 따라 다른 예시 값 반환
    if (fileType === 'businessLicense') {
      exampleData.companyName = 'ABC 주식회사';
      exampleData.businessNumber = '123-45-67890';
      exampleData.representativeName = '홍길동';
      exampleData.address = '서울특별시 강남구 테헤란로 123';
      exampleData.businessType = '도매 및 소매업';
      exampleData.businessItem = '전자제품 판매';
    } else if (fileType === 'credit') {
      exampleData.creditRating = 'A+';
      exampleData.riskRating = '낮음';
      exampleData.memo = '크레탑 파일에서 추출된 신용정보입니다.';
    } else if (fileType === 'callRecording') {
      exampleData.memo = '통화 녹음 파일에서 추출된 정보입니다.';
    }
    
    return NextResponse.json(exampleData);
  } catch (error) {
    return NextResponse.json(
      { error: '파일 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}


