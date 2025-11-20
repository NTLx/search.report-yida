# 获取企业内部应用的accessToken

## 请求示例

```shell
curl -X POST "https://api.dingtalk.com/v1.0/oauth2/accessToken" \
  -H "Content-Type: application/json" \
  -d '{
    "appKey": "xxx",
    "appSecret": "xxx"
  }'
```

## 响应示例

```json
{"expireIn":7200,"accessToken":"xxx"}
```

# 获取多个表单实例ID

## 请求示例

```shell
curl -X POST "https://api.dingtalk.com/v2.0/yida/forms/instances/ids/xxx/xxx?pageNumber=1&pageSize=100" \
  -H "Content-Type: application/json" \
  -H "x-acs-dingtalk-access-token: xxx" \
  -d '{
    "systemToken": "xxx",
    "userId": "xxx",
    "language": "zh_CN",
    "searchFieldJson": "{\"textField_lgsqj5qy\":\"xxx\",\"textField_lgsqj5qz\":\"xxx\"}",
    "useAlias": true
  }'
```

## 响应示例

```json
{"pageNumber":1,"data":["xxx"],"totalCount":1}
```

# 批量获取表单实例数据

## 请求示例

```shell
curl -X POST "https://api.dingtalk.com/v1.0/yida/forms/instances/ids/query" \
  -H "Content-Type: application/json" \
  -H "x-acs-dingtalk-access-token: xxx" \
  -d '{
    "formUuid": "xxx",
    "appType": "xxx",
    "systemToken": "xxx",
    "formInstanceIdList": [
      "xxx"
    ],
    "needFormInstanceValue": true,
    "userId": "xxx"
  }'
```

## 响应示例

```json
{"result":[{"createTimeGMT":"2025-11-18T16:25Z","modifyUser":{"name":{"nameInChinese":"xxx","nameInEnglish":"xxx"},"userId":"xxx"},"creatorUserId":"xxx","serialNumber":"xxx","modifiedTimeGMT":"2025-11-18T16:26Z","modifier":"xxx","formData":{"attachmentField_lgsqj5r0":"[{\"downloadUrl\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\",\"fileUuid\":\"xxx\",\"name\":\"xxx.pdf\",\"previewUrl\":\"/inst/preview?appType=xxx&fileName=xxx&fileSize=284505&downloadUrl=xxx&size\":284505,\"url\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"},{\"downloadUrl\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\",\"fileUuid\":\"xxx\",\"name\":\"xxx.pdf\",\"previewUrl\":\"/inst/preview?appType=xxx&fileName=xxx&fileSize=274079&downloadUrl=xxx&size\":274079,\"url\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"}]","textField_lgsqj5qy":"xxx","textField_lgsqj5qz":"xxx","serialNumberField_lgyofrbg":"xxx","textareaField_lgyotoqy":"xxx","tableField_lgxcinrm":[{"textField_lgsu10nb":"xxx.pdf","textField_lgsu10na":"https://www.aliwork.com/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download"},{"textField_lgsu10nb":"xxx.pdf","textField_lgsu10na":"https://www.aliwork.com/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download"}]},"formInstanceId":"xxx","originator":{"name":{"nameInChinese":"xxx","nameInEnglish":"xxx"},"userId":"xxx"},"title":"{\"en_US\":\"xxx\",\"pureEn_US\":\"xxx\",\"type\":\"i18n\",\"zh_CN\":\"xxx\"}","version":9,"instanceValue":"[{\"componentName\":\"TextField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"value\":\"xxx\"},\"fieldDataUpdated\":false,\"fieldId\":\"textField_lgsqj5qy\",\"format\":null,\"formatControls\":null,\"listNum\":null,\"options\":[],\"rowId\":null},{\"componentName\":\"TextField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"value\":\"xxx\"},\"fieldDataUpdated\":false,\"fieldId\":\"textField_lgsqj5qz\",\"format\":null,\"formatControls\":null,\"listNum\":null,\"options\":[],\"rowId\":null},{\"componentName\":\"TextareaField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"value\":\"xxx\"},\"fieldDataUpdated\":false,\"fieldId\":\"textareaField_lgyotoqy\",\"format\":null,\"formatControls\":null,\"listNum\":null,\"options\":[],\"rowId\":null},{\"componentName\":\"TableField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"totalCount\":0,\"value\":[[{\"listNum\":null,\"formatControls\":null,\"dateType\":null,\"dataVersion\":1,\"fieldData\":{\"value\":\"xxx.pdf\"},\"fieldDataUpdated\":false,\"format\":null,\"options\":[],\"componentName\":\"TextField\",\"fieldId\":\"textField_lgsu10nb\",\"rowId\":\"xxx\"},{\"listNum\":null,\"formatControls\":null,\"dateType\":null,\"dataVersion\":1,\"fieldData\":{\"value\":\"https://www.aliwork.com/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"},\"fieldDataUpdated\":false,\"format\":null,\"options\":[],\"componentName\":\"TextField\",\"fieldId\":\"textField_lgsu10na\",\"rowId\":\"xxx\"}],[{\"listNum\":null,\"formatControls\":null,\"dateType\":null,\"dataVersion\":1,\"fieldData\":{\"value\":\"xxx.pdf\"},\"fieldDataUpdated\":false,\"format\":null,\"options\":[],\"componentName\":\"TextField\",\"fieldId\":\"textField_lgsu10nb\",\"rowId\":\"xxx\"},{\"listNum\":null,\"formatControls\":null,\"dateType\":null,\"dataVersion\":1,\"fieldData\":{\"value\":\"https://www.aliwork.com/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"},\"fieldDataUpdated\":false,\"format\":null,\"options\":[],\"componentName\":\"TextField\",\"fieldId\":\"textField_lgsu10na\",\"rowId\":\"xxx\"}]]},\"fieldDataUpdated\":false,\"fieldId\":\"tableField_lgxcinrm\",\"format\":null,\"formatControls\":null,\"listNum\":50,\"options\":[],\"rowId\":null},{\"componentName\":\"AttachmentField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"value\":[{\"previewUrl\":\"/inst/preview?appType=xxx&fileName=xxx&fileSize=284505&downloadUrl=xxx&size\":284505,\"name\":\"xxx.pdf\",\"downloadUrl\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\",\"fileUuid\":\"xxx\",\"url\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"},{\"previewUrl\":\"/inst/preview?appType=xxx&fileName=xxx&fileSize=274079&downloadUrl=xxx&size\":274079,\"name\":\"xxx.pdf\",\"downloadUrl\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\",\"fileUuid\":\"xxx\",\"url\":\"/ossFileHandle?appType=xxx&fileName=xxx&instId=&type=download\"}]},\"fieldDataUpdated\":false,\"fieldId\":\"attachmentField_lgsqj5r0\",\"format\":null,\"formatControls\":null,\"listNum\":null,\"options\":[],\"rowId\":null},{\"componentName\":\"SerialNumberField\",\"dataVersion\":null,\"dateType\":null,\"fieldData\":{\"value\":\"xxx\"},\"fieldDataUpdated\":false,\"fieldId\":\"serialNumberField_lgyofrbg\",\"format\":null,\"formatControls\":null,\"listNum\":null,\"options\":[],\"rowId\":null}]"}]}
```
