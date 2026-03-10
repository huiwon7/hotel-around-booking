interface TelegramNotifyData {
  reservationNo: string;
  guestName: string;
  guestPhone: string;
  roomType: string;
  packageName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalPrice: number;
}

export async function sendTelegramNotification(
  data: TelegramNotifyData
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials not configured");
    return false;
  }

  const priceFormatted = new Intl.NumberFormat("ko-KR").format(data.totalPrice);

  const message = [
    "🏨 *새 예약 접수*",
    "",
    `📋 예약번호: \`${data.reservationNo}\``,
    `👤 예약자: ${data.guestName}`,
    `📞 연락처: ${data.guestPhone}`,
    `🏠 객실: ${data.roomType}`,
    data.packageName ? `📦 패키지: ${data.packageName}` : "",
    `📅 체크인: ${data.checkIn}`,
    `📅 체크아웃: ${data.checkOut}`,
    `🌙 ${data.nights}박`,
    `👥 ${data.guestsCount}명`,
    `💰 금액: ₩${priceFormatted}`,
    "",
    "관리자 페이지에서 확인해주세요.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return false;
  }
}
