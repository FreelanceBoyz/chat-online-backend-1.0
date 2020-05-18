import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
export class Utils {
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
