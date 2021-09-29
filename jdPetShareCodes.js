/*
东东萌宠互助码
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
let PetShareCodes = [
  '',//账号一的好友shareCode
  '',//账号二的好友shareCode
]

if (process.env.PETSHARECODES) {
  CKNumber = process.env.PETSHARECODES.split('&')[0];
  FruitShareCodes = process.env.PETSHARECODES.split('&')[1];
} else {
  console.log(`由于您环境变量(PETSHARECODES)里面未提供助力码，故此处运行将会给脚本内置的码进行助力，请知晓！`)
}

for (let i = 0; i < Number(CKNumber); i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['PetShareCode' + index] = PetShareCodes;
}
