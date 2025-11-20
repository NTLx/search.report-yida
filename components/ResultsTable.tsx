'use client';

import { 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  User,
  Tooltip,
  Card
} from '@heroui/react';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';

interface Report {
  fileName: string;
  downloadUrl: string | null;
  createTime: string;
  formInstanceId: string;
  error: string | null;
}

interface ResultsTableProps {
  results: Report[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '未知';
    
    // 如果日期已经是"yyyy年MM月dd日"格式，直接返回
    if (dateString.includes('年') && dateString.includes('月') && dateString.includes('日')) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    // 创建一个隐藏的a标签来触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return (
      <Card className="py-12 px-6 bg-default-50 dark:bg-default-100">
        <div className="flex flex-col items-center justify-center text-center">
          <FileText className="mb-4 text-default-400" size={48} />
          <h3 className="text-xl font-medium mb-2">未找到相关报告</h3>
          <p className="text-default-500 max-w-md">
            请检查您输入的姓名和手机号是否正确，或者该时间段内可能没有相关报告。
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table 
        aria-label="报告查询结果表格" 
        removeWrapper
        classNames={{
          th: "bg-default-100 dark:bg-default-50 text-default-600 text-xs sm:text-sm text-center",
          td: "text-xs sm:text-sm py-2 sm:py-3 text-center",
        }}
        layout="auto"
      >
        <TableHeader>
          <TableColumn className="min-w-[150px] max-w-[300px]">文件名</TableColumn>
          <TableColumn className="w-[160px] sm:w-[180px]">创建时间</TableColumn>
          <TableColumn className="w-[100px] sm:w-[120px]">操作</TableColumn>
        </TableHeader>
        <TableBody emptyContent="暂无数据">
          {results.map((report, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <FileText className="text-default-400 flex-shrink-0" size={16} />
                  <span className="font-medium break-words text-center">{report.fileName}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs sm:text-sm">{formatDate(report.createTime)}</span>
              </TableCell>
              <TableCell>
                {report.downloadUrl ? (
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    startContent={<Download size={14} />}
                    className="min-w-0 px-2 sm:px-3"
                    onPress={() => handleDownload(report.downloadUrl!, report.fileName)}
                  >
                    <span className="hidden sm:inline">下载</span>
                  </Button>
                ) : (
                  <Tooltip content={report.error || '文件正在处理中'}>
                    <Button
                      isDisabled
                      color="default"
                      variant="flat"
                      size="sm"
                      className="min-w-0 px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">不可用</span>
                    </Button>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}