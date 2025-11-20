'use client';

import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Input, 
  Form,
  Spacer,
  Divider,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  User,
  Link
} from '@heroui/react';
import { Search, FileText, Download, Calendar, User as UserIcon, Phone } from 'lucide-react';
import QueryForm from '@/components/QueryForm';
import ResultsTable from '@/components/ResultsTable';

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  const handleSearch = async (name: string, phone: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/query-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        console.error('查询失败:', data.message);
        setResults([]);
      }
    } catch (error) {
      console.error('请求错误:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="grid-background"></div>
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {/* 页面标题 */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
          <CardBody className="text-center py-6 sm:py-8 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">报告查询系统</h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90">通过姓名和手机号快速查询您的报告</p>
          </CardBody>
        </Card>

        {/* 查询表单 */}
        <QueryForm onSearch={handleSearch} isLoading={isLoading} />

        {/* 结果展示区域 */}
        {hasSearched && (
          <Card className="mt-6 sm:mt-8 shadow-lg">
            <CardHeader className="pb-0 pt-4 sm:pt-6 px-4 sm:px-6 flex-col items-start">
              <h2 className="text-xl sm:text-2xl font-semibold">查询结果</h2>
              {results.length > 0 && (
                <p className="text-xs sm:text-sm text-default-500 mt-1">
                  共找到 {pagination.totalCount} 份报告
                </p>
              )}
            </CardHeader>
            <CardBody className="px-4 sm:px-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <Progress 
                    size="lg" 
                    color="primary" 
                    isIndeterminate 
                    className="max-w-md mb-4"
                  />
                  <p className="text-xs sm:text-sm text-default-500 text-center">正在查询中，请稍候...</p>
                </div>
              ) : (
                <ResultsTable results={results} />
              )}
              
              {/* 分页 */}
              {results.length > 0 && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Pagination
                    total={pagination.totalPages}
                    initialPage={pagination.currentPage}
                    onChange={(page) => console.log(`切换到第 ${page} 页`)}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}