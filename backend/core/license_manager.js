export class LicenseManager {
  constructor() {
    this.activeLicenses = {
      'LUMINA-FLAXY-LIFETIME-KEY': { registeredDevice: 'Android-Device', active: true }
    };
  }

  validateKey(key) {
    return this.activeLicenses[key] ? true : false;
  }
}
