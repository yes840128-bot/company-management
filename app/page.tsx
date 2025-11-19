import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">업체 관리 시스템</h1>
        <p className="text-lg text-gray-600 mb-8">업체 정보를 효율적으로 관리하세요</p>
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium inline-block"
        >
          업체 목록 보기
        </Link>
      </div>
    </div>
  );
}
