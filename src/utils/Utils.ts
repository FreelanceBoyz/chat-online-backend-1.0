import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
export class Utils {

  public static parseAuthHeader(hdrValue) {
    if (typeof hdrValue !== "string") {
      return null;
    }
    const matches = hdrValue.match(/(\S+)\s+(\S+)/);
    return matches && { scheme: matches[1], value: matches[2] };
  }

  public static async hashPassword(password: string): Promise<string> {
    try {
      const pass256 = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      const hash = await bcrypt.hash(pass256, 10);
      return hash;
    } catch (e) {
      Promise.reject(e);
    }
  }
}
