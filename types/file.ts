// 파일 정보 타입 정의
export interface UploadedFile {
  id: string;
  companyId: string;
  fileName: string; // 원본 파일명 (호환성 유지)
  fileType: string; // 파일 종류 ('business_license' | 'credit' | 'call_recording')
  filePath: string; // 서버에 저장된 파일 경로 (전체 경로)
  originalName: string | null; // 원본 파일명 (사용자가 업로드한 파일명)
  storedName: string | null; // 서버에 저장된 최종 파일명
  extractedText: string | null; // 파일에서 추출한 원본 텍스트 (OCR/AI 결과)
  status: string | null; // 상태 ('사용중', '삭제됨' 등)
  createdAt: string; // 생성일시 (ISO 문자열)
}

// 파일 목록 조회 API 응답 타입
export interface FileListResponse {
  id: string;
  fileType: string;
  originalName: string;
  uploadedAt: string;
  status: string | null;
  extractedText?: string;
}


