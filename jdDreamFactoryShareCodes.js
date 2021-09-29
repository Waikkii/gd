/*
京喜工厂互助码
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
let shareCodes = [
  '',//账号一的好友shareCode
  '',//账号二的好友shareCode
]
let CKNumber = ''
if (process.env.DREAM_FACTORY_SHARE_CODES) {
  CKNumber = process.env.DREAM_FACTORY_SHARE_CODES.split('&')[0];
  FruitShareCodes = process.env.DREAM_FACTORY_SHARE_CODES.split('&')[1];
} else {
  console.log(`由于您环境变量(DREAM_FACTORY_SHARE_CODES)里面未提供助力码，故此处运行将会给脚本内置的码进行助力，请知晓！`)
}

for (let i = 0; i < Number(CKNumber); i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['shareCodes' + index] = shareCodes;
}



