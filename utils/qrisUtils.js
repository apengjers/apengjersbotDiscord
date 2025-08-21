const qrisDinamis = require('@agungjsp/qris-dinamis');

const qrisStatis = '00020101021126650013ID.CO.BCA.WWW011893600014000192221102150008850019222110303UMI51440014ID.CO.QRIS.WWW0215ID10232531380860303UMI5204594553033605802ID5912TU APENGJERS6006BEKASI61051713562070703A01630401E6';

function generateQrisDinamis(nominal) {
  const result = qrisDinamis.makeString(qrisStatis, {
    nominal: nominal.toString(),
    taxtype: 'r', // rupiah
    fee: '0'
  });

  return result;
}

module.exports = {
  generateQrisDinamis
};
