export class DateUtil {
    /**
     * Convierte una fecha a formato ISO string para la base de datos
     */
    static toISOString(date: Date): string {
        return date.toISOString();
    }

    /**
     * Crea una fecha de expiración agregando días a la fecha actual
     */
    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Crea una fecha de expiración agregando horas a la fecha actual
     */
    static addHours(date: Date, hours: number): Date {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }

    /**
     * Crea una fecha de expiración agregando minutos a la fecha actual
     */
    static addMinutes(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    /**
     * Verifica si una fecha ha expirado
     */
    static isExpired(date: Date): boolean {
        return new Date() > date;
    }

    /**
     * Obtiene la fecha actual
     */
    static now(): Date {
        return new Date();
    }

    /**
     * Formatea una fecha para mostrar al usuario
     */
    static formatForDisplay(date: Date, locale: string = 'es-CR'): string {
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Calcula la diferencia en días entre dos fechas
     */
    static daysDifference(date1: Date, date2: Date): number {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * Verifica si una fecha está dentro de un rango
     */
    static isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
        return date >= startDate && date <= endDate;
    }
}