const cacheService = require('./cacheService');

// 配置常量 - 使用大写环境变量
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_TYPE = process.env.APP_TYPE;
const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN;
const FORM_UUID = process.env.FORM_UUID;
const USERID = process.env.USERID;
const TIMEOUT = process.env.TIMEOUT || 86400000; // 默认24小时
const NAME_FIELD_ID = process.env.NAME_FIELD_ID;
const PHONE_FIELD_ID = process.env.PHONE_FIELD_ID;
const ATTACHMENT_FIELD_ID = process.env.ATTACHMENT_FIELD_ID;

// 缓存键
const ACCESS_TOKEN_KEY = 'dingtalk_access_token';
const ACCESS_TOKEN_TTL = 7200 * 1000; // accessToken有效期，通常为2小时

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

/**
 * 延迟函数
 * @param {number} ms 延迟毫秒数
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带重试机制的fetch函数
 * @param {string} url 请求URL
 * @param {object} options 请求选项
 * @param {number} retries 剩余重试次数
 * @returns {Promise<any>}
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 10000, // 10秒超时
    });

    if (!response.ok) {
      // 尝试获取错误响应内容
      let errorContent = '';
      try {
        errorContent = await response.text();
        console.error('错误响应内容:', errorContent);
      } catch (e) {
        console.error('无法获取错误响应内容');
      }
      throw new Error(`HTTP error! status: ${response.status}, content: ${errorContent}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`请求失败 (${url}): ${error.message}`);

    if (retries > 0) {
      console.log(`剩余重试次数: ${retries}, 等待${RETRY_DELAY}ms后重试...`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
}

/**
 * 获取钉钉企业内部应用的accessToken
 * @returns {Promise<string>} accessToken
 */
async function getAccessToken() {
  try {
    // 尝试从缓存获取accessToken
    const cachedToken = cacheService.get(ACCESS_TOKEN_KEY);
    if (cachedToken) {
      console.log('从缓存获取accessToken');
      return cachedToken;
    }

    console.log('缓存中无accessToken，开始从API获取');
    const url = `https://api.dingtalk.com/v1.0/oauth2/accessToken`;
    const requestBody = {
      appKey: CLIENT_ID,
      appSecret: CLIENT_SECRET
    };

    console.log(`请求URL: ${url}`);
    console.log('请求体:', JSON.stringify(requestBody));

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API响应:', JSON.stringify(response));

    if (!response.accessToken) {
      throw new Error(`获取accessToken失败: ${JSON.stringify(response)}`);
    }

    // 将accessToken存入缓存，设置过期时间（比实际过期时间少10分钟，避免边界情况）
    const tokenTtl = (response.expireIn || 7200) * 1000 - 10 * 60 * 1000;
    cacheService.set(ACCESS_TOKEN_KEY, response.accessToken, tokenTtl);

    console.log('成功获取并缓存accessToken');
    return response.accessToken;
  } catch (error) {
    console.error('获取accessToken时发生错误:', error);
    // 清除可能无效的缓存
    cacheService.delete(ACCESS_TOKEN_KEY);
    throw error;
  }
}

/**
 * 验证accessToken是否有效
 * @param {string} accessToken 访问令牌
 * @returns {Promise<boolean>} 是否有效
 */
async function validateAccessToken(accessToken) {
  try {
    // 使用一个简单的API调用来验证token是否有效
    const url = `https://api.dingtalk.com/v1.0/contact/users/me`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-acs-dingtalk-access-token': accessToken
      }
    });

    // 检查响应状态码
    if (response.status === 401 || response.status === 403) {
      return false;
    }

    // 尝试解析响应
    const responseData = await response.json();

    // 检查响应中是否有错误信息
    if (responseData.code && (responseData.code === 'InvalidAuthentication' || responseData.code === 'InvalidToken')) {
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('验证accessToken时发生错误:', error);
    return false;
  }
}

/**
 * 获取有效的accessToken
 * @returns {Promise<string>} 有效的accessToken
 */
async function getValidAccessToken() {
  try {
    console.log('开始获取有效的accessToken...');

    // 尝试从缓存获取accessToken
    let accessToken = cacheService.get(ACCESS_TOKEN_KEY);
    console.log('缓存检查结果:', accessToken ? '找到token' : '未找到token');

    // 如果缓存中有token，验证其是否有效
    if (accessToken) {
      console.log('从缓存获取到token，开始验证...');
      const isValid = await validateAccessToken(accessToken);
      console.log('token验证结果:', isValid ? '有效' : '无效');

      if (isValid) {
        console.log('使用缓存中的有效accessToken');
        return accessToken;
      } else {
        console.log('缓存中的accessToken无效，清除缓存');
        cacheService.delete(ACCESS_TOKEN_KEY);
      }
    }

    // 获取新的accessToken
    console.log('缓存中无有效token，开始获取新的accessToken...');
    const newToken = await getAccessToken();
    console.log('成功获取新的accessToken，长度:', newToken ? newToken.length : 0);

    return newToken;
  } catch (error) {
    console.error('获取有效accessToken时发生错误:', error.message);
    console.error('错误详情:', error);
    throw error;
  }
}

/**
 * 步骤1: 获取宜搭表单实例ID列表
 * @param {string} accessToken 访问令牌
 * @param {Object} queryParams 查询参数
 * @returns {Promise<Object>} 表单实例ID列表和分页信息
 */
async function getFormInstanceIds(accessToken, queryParams) {
  try {
    const { fromDate, toDate, searchType, searchValue, pageSize = 100, currentPage = 1 } = queryParams;

    // 根据示例文档，使用正确的API端点
    const url = `https://api.dingtalk.com/v2.0/yida/forms/instances/ids/${APP_TYPE}/${FORM_UUID}?pageNumber=${currentPage}&pageSize=${pageSize}`;

    // 构建搜索字段JSON，根据示例文档格式
    let searchFieldJson = {};

    if (searchType === 'nameAndPhone' && searchValue) {
      // 同时使用姓名和手机号进行查询
      searchFieldJson[NAME_FIELD_ID] = searchValue.name;
      searchFieldJson[PHONE_FIELD_ID] = searchValue.phone;
    } else if (searchType === 'name' && searchValue) {
      searchFieldJson[NAME_FIELD_ID] = searchValue;
    } else if (searchType === 'phone' && searchValue) {
      searchFieldJson[PHONE_FIELD_ID] = searchValue;
    }

    // 如果有日期范围，添加到搜索条件
    if (fromDate && toDate) {
      searchFieldJson = {
        ...searchFieldJson,
        gmtCreate: {
          fromDate,
          toDate
        }
      };
    }

    const requestBody = {
      systemToken: SYSTEM_TOKEN,
      userId: USERID,
      language: "zh_CN",
      searchFieldJson: JSON.stringify(searchFieldJson),
      useAlias: true
    };

    console.log(`步骤1: 获取实例ID列表 - 搜索类型=${searchType}, 搜索值=${searchValue}`);
    console.log('查询请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-acs-dingtalk-access-token': accessToken
      },
      body: JSON.stringify(requestBody)
    });

    console.log('查询响应:', JSON.stringify(response, null, 2));

    // 根据示例文档，响应格式应为 {"pageNumber":1,"data":["实例ID1","实例ID2"],"totalCount":N}
    if (!response || !Array.isArray(response.data)) {
      throw new Error(`获取表单实例ID失败: 响应格式不匹配 - ${JSON.stringify(response)}`);
    }

    const instanceIds = response.data;
    console.log(`步骤1完成: 找到 ${instanceIds.length} 个表单实例ID: ${instanceIds.join(', ')}`);

    return {
      data: instanceIds,
      totalCount: response.totalCount || instanceIds.length,
      currentPage: response.pageNumber || currentPage,
      pageSize
    };
  } catch (error) {
    console.error('获取表单实例ID时发生错误:', error);
    throw error;
  }
}

/**
 * 批量获取表单实例数据
 * @param {Array} instanceIds - 表单实例ID数组
 * @param {string} accessToken - 访问令牌
 * @returns {Promise<Object>} 表单实例数据
 */
async function getFormDataBatch(instanceIds, accessToken) {
  try {
    // 使用正确的API端点
    const url = `https://api.dingtalk.com/v1.0/yida/forms/instances/ids/query`;

    const requestData = {
      formUuid: FORM_UUID,
      appType: APP_TYPE,
      systemToken: SYSTEM_TOKEN,
      formInstanceIdList: instanceIds,
      needFormInstanceValue: true,
      userId: USERID
    };

    console.log('批量获取表单实例数据请求:', {
      url,
      method: 'POST',
      headers: {
        'x-acs-dingtalk-access-token': '[HIDDEN]',
        'Content-Type': 'application/json'
      },
      data: requestData
    });

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'x-acs-dingtalk-access-token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('批量获取表单实例数据响应:', JSON.stringify(response, null, 2));

    // 根据API文档，响应格式为 { "result": [...] }
    if (response && response.result) {
      return response;
    } else {
      throw new Error(`批量获取表单实例数据失败: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    console.error('批量获取表单实例数据失败:', error.message);
    throw error;
  }
}

/**
 * 查询报告数据 - 使用新的多步骤查询流程
 * @param {Object} queryParams - 查询参数
 * @param {number} queryParams.fromDate - 开始时间戳
 * @param {number} queryParams.toDate - 结束时间戳
 * @param {string} [queryParams.searchType] - 搜索类型: 'name' 或 'phone'
 * @param {string} [queryParams.searchValue] - 搜索值
 * @param {number} [queryParams.pageSize=100] - 每页数量
 * @param {number} [queryParams.currentPage=1] - 当前页码
 * @returns {Promise<Object>} 查询结果
 */
async function queryReportData(queryParams) {
  try {
    const { fromDate, toDate, searchType, searchValue, pageSize = 100, currentPage = 1 } = queryParams;

    // 步骤1: 获取访问令牌
    const accessToken = await getAccessToken();

    // 步骤2: 获取表单实例ID列表
    const instanceIdsResponse = await getFormInstanceIds(accessToken, {
      fromDate,
      toDate,
      searchType,
      searchValue,
      pageSize,
      currentPage
    });

    // 检查是否有实例ID
    if (!instanceIdsResponse.data || instanceIdsResponse.data.length === 0) {
      return {
        success: true,
        data: [],
        totalCount: 0,
        currentPage,
        pageSize,
        message: '未找到符合条件的报告'
      };
    }

    // 步骤3: 批量获取表单实例数据
    const formDataResponse = await getFormDataBatch(instanceIdsResponse.data, accessToken);

    console.log('批量获取表单实例数据响应结构:', Object.keys(formDataResponse));
    if (formDataResponse.result) {
      console.log('批量获取表单实例数据结果数量:', formDataResponse.result.length);
    }

    // 步骤4: 提取附件信息并处理下载链接
    const reports = await extractAttachments(formDataResponse.result || [], accessToken);

    return {
      success: true,
      data: reports,
      totalCount: instanceIdsResponse.totalCount || reports.length,
      currentPage,
      pageSize
    };
  } catch (error) {
    console.error('查询报告数据失败:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      totalCount: 0,
      currentPage: queryParams.currentPage || 1,
      pageSize: queryParams.pageSize || 100
    };
  }
}

/**
 * 获取附件下载链接
 * @param {string} accessToken 访问令牌
 * @param {string} formInstanceId 表单实例ID
 * @param {Array} fileField 文件字段数据
 * @returns {Promise<string>} 下载链接
 */
async function getAttachmentUrl(accessToken, formInstanceId, fileField) {
  try {
    // 参数验证和日志记录
    console.log(`获取附件下载链接: 表单实例ID=${formInstanceId}`);

    if (!formInstanceId) {
      throw new Error('表单实例ID不能为空');
    }

    if (!fileField) {
      throw new Error('文件字段数据不能为空');
    }

    // 标准化fileField为数组格式
    const attachmentList = Array.isArray(fileField) ? fileField : [fileField];

    if (attachmentList.length === 0) {
      throw new Error('文件字段数据为空数组');
    }

    // 获取第一个附件的信息
    const attachment = attachmentList[0];

    // 尝试多种可能的文件ID字段名
    const fileIdFields = ['fileId', 'id', 'file_id', 'objectId'];
    let fileId = null;

    for (const field of fileIdFields) {
      if (attachment[field]) {
        fileId = attachment[field];
        console.log(`找到文件ID: ${fileId} (从${field}字段获取)`);
        break;
      }
    }

    if (!fileId) {
      throw new Error(`附件缺少有效的文件ID字段，可用字段: ${Object.keys(attachment).join(', ')}`);
    }

    const url = `https://api.dingtalk.com/v1.0/yida/forms/attachments/url`;

    // 记录请求参数（不包含敏感信息）
    console.log(`准备请求临时下载链接，fileId=${fileId}`);

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-acs-dingtalk-access-token': accessToken
      },
      body: JSON.stringify({
        appType: APP_TYPE,
        formUuid: FORM_UUID,
        formInstanceId,
        fileId
      })
    }, {
      maxRetries: 3, // 增加重试次数
      retryDelay: 2000 // 增加重试间隔
    });

    // 详细的响应处理
    if (!response || typeof response !== 'object') {
      throw new Error(`获取附件下载链接失败: 无效的响应格式`);
    }

    // 多种方式判断API响应是否成功
    if (response.errcode !== 0 && response.code !== 0 && response.success !== true) {
      throw new Error(`获取附件下载链接失败: ${response.message || response.errorMessage || JSON.stringify(response)}`);
    }

    // 尝试多种可能的URL字段名
    let downloadUrl = null;
    if (response.result && response.result.url) {
      downloadUrl = response.result.url;
    } else if (response.url) {
      downloadUrl = response.url;
    } else if (response.data && response.data.url) {
      downloadUrl = response.data.url;
    }

    if (!downloadUrl) {
      throw new Error(`获取附件下载链接失败: 响应中缺少URL字段`);
    }

    console.log(`成功获取附件下载链接`);
    return downloadUrl;
  } catch (error) {
    console.error('获取附件下载链接时发生错误:', error.message || error);
    throw new Error(`附件下载链接生成失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 获取宜搭附件临时免登地址
 * @param {string} accessToken 访问令牌
 * @param {string} fileUrl 宜搭附件原始地址
 * @param {number} [timeout=60000] 临时地址失效时间，单位毫秒，默认1分钟
 * @returns {Promise<string>} 临时免登地址
 */
async function getTemporaryAttachmentUrl(accessToken, fileUrl, timeout = 60000) {
  try {
    console.log(`获取宜搭附件临时免登地址: fileUrl=${fileUrl}`);

    if (!fileUrl) {
      throw new Error('文件URL不能为空');
    }

    // 构建API请求URL
    const url = `https://api.dingtalk.com/v1.0/yida/apps/temporaryUrls/${APP_TYPE}`;

    // 构建查询参数
    const params = new URLSearchParams({
      systemToken: SYSTEM_TOKEN,
      userId: USERID,
      language: "zh_CN",
      fileUrl: fileUrl,
      timeout: timeout.toString()
    });

    const fullUrl = `${url}?${params.toString()}`;

    console.log(`请求临时免登地址API: ${fullUrl}`);

    const response = await fetchWithRetry(fullUrl, {
      method: 'GET',
      headers: {
        'x-acs-dingtalk-access-token': accessToken
      }
    });

    // 检查响应是否包含临时免登地址
    if (!response || !response.result) {
      throw new Error(`获取临时免登地址失败: ${JSON.stringify(response)}`);
    }

    const temporaryUrl = response.result;
    console.log(`成功获取临时免登地址: ${temporaryUrl}`);

    return temporaryUrl;
  } catch (error) {
    console.error('获取宜搭附件临时免登地址时发生错误:', error.message || error);
    throw new Error(`获取临时免登地址失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 从表单数据中提取附件信息
 * @param {Array} formDataList - 表单数据列表
 * @param {string} accessToken - 访问令牌
 * @returns {Promise<Array>} 报告列表
 */
async function extractAttachments(formDataList, accessToken) {
  console.log('开始提取附件信息，表单数据数量:', formDataList.length);
  const reports = [];

  for (const formData of formDataList) {
    console.log('处理表单数据:', formData.formInstanceId);
    try {
      // 从instanceValue中解析附件字段数据
      let instanceValue;
      try {
        if (typeof formData.instanceValue === 'string') {
          instanceValue = JSON.parse(formData.instanceValue);
        } else {
          instanceValue = formData.instanceValue;
        }
      } catch (e) {
        console.error('解析instanceValue失败:', e);
        continue;
      }

      console.log('表单实例数据字段数量:', instanceValue.length);

      // 查找附件字段
      const attachmentField = instanceValue.find(item => item.fieldId === ATTACHMENT_FIELD_ID);

      if (attachmentField && attachmentField.fieldData && attachmentField.fieldData.value) {
        const attachmentList = attachmentField.fieldData.value;
        console.log('找到附件字段，附件数量:', attachmentList.length);

        if (Array.isArray(attachmentList) && attachmentList.length > 0) {
          // 为每个附件创建报告记录
          for (const attachment of attachmentList) {
            // 提取创建时间并格式化
            let createTime = '';
            if (formData.createTimeGMT) {
              try {
                // 解析时间字符串并格式化为yyyy年MM月dd日
                const date = new Date(formData.createTimeGMT);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                createTime = `${year}年${month}月${day}日`;
              } catch (e) {
                console.warn('时间格式化失败:', formData.createTimeGMT);
                createTime = formData.createTimeGMT;
              }
            }

            // 构建原始下载URL
            let originalUrl = '';
            if (attachment.downloadUrl) {
              // 如果downloadUrl是相对路径，添加基础URL
              if (attachment.downloadUrl.startsWith('/')) {
                originalUrl = `https://www.aliwork.com${attachment.downloadUrl}`;
              } else {
                originalUrl = attachment.downloadUrl;
              }
            } else if (attachment.url) {
              if (attachment.url.startsWith('/')) {
                originalUrl = `https://www.aliwork.com${attachment.url}`;
              } else {
                originalUrl = attachment.url;
              }
            } else if (attachment.previewUrl) {
              if (attachment.previewUrl.startsWith('/')) {
                originalUrl = `https://www.aliwork.com${attachment.previewUrl}`;
              } else {
                originalUrl = attachment.previewUrl;
              }
            }

            reports.push({
              formInstanceId: formData.formInstanceId,
              fileName: attachment.name,
              fileSize: attachment.size,
              fileField: attachment,  // 传递完整的附件对象
              previewUrl: attachment.previewUrl || '',
              originalUrl: originalUrl, // 保存原始URL
              downloadUrl: '', // 临时免登地址将在后面获取
              gmtCreate: formData.createTimeGMT, // 添加原始创建时间
              createTime: createTime, // 添加格式化后的创建时间
            });
          }
        }
      } else {
        console.log('未找到附件字段或附件字段为空');
      }
    } catch (parseError) {
      console.error(`处理表单数据失败:`, parseError.message);
    }
  }

  // 为每个附件获取临时免登地址
  for (const report of reports) {
    if (report.originalUrl) {
      try {
        console.log(`为文件 ${report.fileName} 获取临时免登地址`);
        report.downloadUrl = await getTemporaryAttachmentUrl(accessToken, report.originalUrl);
        report.error = null; // 清除可能的错误标记
      } catch (error) {
        console.error(`获取文件 ${report.fileName} 的临时免登地址失败:`, error.message);
        report.downloadUrl = null;
        report.error = `获取临时免登地址失败: ${error.message}`;
      }
    } else {
      console.log(`文件 ${report.fileName} 没有原始URL，无法获取临时免登地址`);
      report.downloadUrl = null;
      report.error = '没有原始URL';
    }
  }

  console.log('提取附件完成，报告数量:', reports.length);
  return reports;
}

module.exports = {
  getAccessToken,
  getValidAccessToken,
  getFormInstanceIds,
  getFormDataBatch,
  extractAttachments,
  queryReportData,
  getAttachmentUrl
};