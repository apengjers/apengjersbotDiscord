function formatTimestampToWIB(timestamp) {
  const date = new Date(timestamp + 7 * 60 * 60 * 1000);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m} WIB`;
}

module.exports = { formatTimestampToWIB };
