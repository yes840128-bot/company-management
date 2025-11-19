'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// UploadedFile 타입 정의 (API 응답 형식에 맞춤)
interface UploadedFile {
  id: number;
  fileType: string;
  originalName: string;
  storedName: string;
  path: string;
  uploadedAt: string;
}

export default function FilesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('business_license'); // 드롭다운 값과 맞추기
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]); // 목록 표시용
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 목록 조회
  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch('/api/files');
      if (!res.ok) return;
      const data = await res.json();
      setFiles(data);
    };
    fetchFiles();
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('먼저 파일을 선택해 주세요.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', fileType);

      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? '파일 업로드에 실패했습니다.');
        return;
      }

      const uploaded = await res.json();
      alert('파일 업로드가 완료되었습니다.');

      // 목록 갱신
      setFiles((prev) => [uploaded, ...prev]);
      setSelectedFile(null);

      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('upload error', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 파일 종류 한글 변환
  const getFileTypeKorean = (type: string): string => {
    switch (type) {
      case 'business_license':
        return '사업자등록증';
      case 'credit':
        return '크레탑';
      case 'call_recording':
        return '통화녹음';
      default:
        return type;
    }
  };

  // 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단: 제목과 뒤로 가기 */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">파일 업로드</h1>
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">파일 업로드</h2>

          {/* 파일 종류 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 종류
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="business_license">사업자등록증</option>
              <option value="credit">크레탑</option>
              <option value="call_recording">통화녹음</option>
            </select>
          </div>

          {/* 파일 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 선택
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={
                  fileType === 'business_license'
                    ? '.pdf,.jpg,.jpeg,.png'
                    : fileType === 'credit'
                    ? '.pdf,.xlsx,.xls'
                    : '.mp3,.wav,.m4a'
                }
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                파일 선택
              </button>
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  선택된 파일: {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {/* 업로드 버튼 */}
          <div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                uploading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </div>

        {/* 파일 목록 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">파일 목록</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일종류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업로드일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      업로드된 파일이 없습니다.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => {
                    // 다운로드 URL 생성: path가 있으면 사용하고, 없으면 storedName으로 구성
                    const downloadUrl = file.path ?? `/uploads/${file.storedName}`;

                    return (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a
                            href={downloadUrl}
                            download={file.originalName ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {file.originalName}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getFileTypeKorean(file.fileType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.uploadedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            사용중
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

