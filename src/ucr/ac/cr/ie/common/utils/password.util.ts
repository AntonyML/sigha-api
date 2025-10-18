import * as bcrypt from 'bcrypt';

export class PasswordUtil {
    private static readonly SALT_ROUNDS = 12;

    /**
     * Hashea una contraseña usando bcrypt
     */
    static async hash(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }

    /**
     * Verifica si una contraseña coincide con su hash
     */
    static async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Genera una contraseña temporal aleatoria
     */
    static generateTemporaryPassword(length: number = 12): string {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        return password;
    }

    /**
     * Valida la fortaleza de una contraseña
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra minúscula');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }

        if (!/(?=.*[@#$%^&+=!])/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial (@#$%^&+=!)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}