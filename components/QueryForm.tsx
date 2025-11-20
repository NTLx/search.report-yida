'use client';

import { useState } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Spacer,
  Form,
  Divider
} from '@heroui/react';
import { Search, User as UserIcon, Phone } from 'lucide-react';

interface QueryFormProps {
  onSearch: (name: string, phone: string) => void;
  isLoading: boolean;
}

export default function QueryForm({ onSearch, isLoading }: QueryFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('请输入姓名');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!value.trim()) {
      setPhoneError('请输入手机号');
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError('请输入有效的手机号（11位数字）');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) validateName(value);
  };

  const handlePhoneChange = (value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
    if (phoneError) validatePhone(numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    
    if (isNameValid && isPhoneValid) {
      onSearch(name.trim(), phone.trim());
    }
  };

  return (
    <Card className="shadow-lg bg-white dark:bg-gray-800">
      <CardBody className="p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <Search className="mr-3 text-primary" size={20} />
          <h2 className="text-xl sm:text-2xl font-semibold">查询报告</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="姓名"
            placeholder="请输入您的姓名"
            labelPlacement="outside"
            startContent={
              <UserIcon className="text-xl sm:text-2xl text-default-400 pointer-events-none flex-shrink-0" />
            }
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            isInvalid={!!nameError}
            errorMessage={nameError}
            variant="bordered"
            size="lg"
          />
          
          <Spacer y={4} />
          
          <Input
            label="手机号"
            placeholder="请输入您的手机号"
            labelPlacement="outside"
            startContent={
              <Phone className="text-xl sm:text-2xl text-default-400 pointer-events-none flex-shrink-0" />
            }
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            isInvalid={!!phoneError}
            errorMessage={phoneError}
            variant="bordered"
            size="lg"
            maxLength={11}
          />
          
          <Spacer y={4} />
          
          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-medium"
            isLoading={isLoading}
            startContent={!isLoading && <Search size={20} />}
          >
            {isLoading ? '查询中...' : '查询报告'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}