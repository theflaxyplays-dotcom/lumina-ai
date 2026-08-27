export class AndroidBridge {
  static getWhatsAppUrl(phone, text) {
    const clean = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  }
  static getDialerUrl(phone) {
    return `tel:${phone}`;
  }
}
