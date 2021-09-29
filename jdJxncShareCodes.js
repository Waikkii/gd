/*
京喜农场助力码
此助力码要求种子 active 相同才能助力，多个账号的话可以种植同样的种子，如果种子不同的话，会自动跳过使用云端助力
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
// 注意：京喜农场 种植种子发生变化的时候，互助码也会变！！
// 注意：京喜农场 种植种子发生变化的时候，互助码也会变！！
// 注意：京喜农场 种植种子发生变化的时候，互助码也会变！！
// 每个账号 shareCdoe 是一个 json，示例如下
// {"smp":"22bdadsfaadsfadse8a","active":"jdnc_1_btorange210113_2","joinnum":"1"}
let JxncShareCodes = [
  '',//账号一的好友shareCode
  '',//账号二的好友shareCode
]
if (process.env.JXNC_SHARECODES) {
    CKNumber = process.env.JXNC_SHARECODES.split('&')[0];
    JxncShareCodes = process.env.JXNC_SHARECODES.split('&')[1];
} else {
  console.log(`由于您环境变量里面(JXNC_SHARECODES)未提供助力码，故此处运行将会给脚本内置的码进行助力，请知晓！`)
}

for (let i = 0; i < Number(CKNumber); i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['JxncShareCode' + index] = JxncShareCodes;
}
