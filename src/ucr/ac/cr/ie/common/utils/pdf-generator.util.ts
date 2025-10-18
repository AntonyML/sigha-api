import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface PDFContent {
    title?: string;
    subtitle?: string;
    content: Array<{
        type: 'text' | 'table' | 'image' | 'line';
        data: any;
        style?: any;
    }>;
}

export class PDFGeneratorUtil {
    /**
     * Genera un PDF básico con contenido estructurado
     */
    static async generatePDF(content: PDFContent, res?: Response): Promise<Buffer | void> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks: Buffer[] = [];

                if (res) {
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
                    doc.pipe(res);
                } else {
                    doc.on('data', (chunk) => chunks.push(chunk));
                }

                doc.on('end', () => {
                    if (!res) {
                        resolve(Buffer.concat(chunks));
                    }
                });

                doc.on('error', reject);

                // Título principal
                if (content.title) {
                    doc.fontSize(20).font('Helvetica-Bold').text(content.title, 50, 50);
                    doc.moveDown(1);
                }

                // Subtítulo
                if (content.subtitle) {
                    doc.fontSize(14).font('Helvetica').text(content.subtitle);
                    doc.moveDown(1);
                }

                // Contenido
                content.content.forEach((item) => {
                    switch (item.type) {
                        case 'text':
                            doc.fontSize(12).font('Helvetica').text(item.data);
                            doc.moveDown(0.5);
                            break;

                        case 'line':
                            doc.moveTo(50, doc.y)
                                .lineTo(550, doc.y)
                                .stroke();
                            doc.moveDown(0.5);
                            break;

                        case 'table':
                            this.addTable(doc, item.data);
                            break;
                    }
                });

                doc.end();

                if (res) {
                    resolve();
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Agrega una tabla simple al documento PDF
     */
    private static addTable(doc: any, tableData: { headers: string[]; rows: string[][] }) {
        const { headers, rows } = tableData;
        const startX = 50;
        let currentY = doc.y;
        const colWidth = (550 - 50) / headers.length;

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, startX + (i * colWidth), currentY, {
                width: colWidth,
                align: 'left'
            });
        });

        currentY += 20;
        doc.moveTo(startX, currentY).lineTo(550, currentY).stroke();
        currentY += 5;

        // Rows
        doc.font('Helvetica');
        rows.forEach((row) => {
            row.forEach((cell, i) => {
                doc.text(cell, startX + (i * colWidth), currentY, {
                    width: colWidth,
                    align: 'left'
                });
            });
            currentY += 15;
        });

        doc.y = currentY + 10;
    }

    /**
     * Genera un reporte de usuario
     */
    static async generateUserReport(userData: any, res?: Response): Promise<Buffer | void> {
        const content: PDFContent = {
            title: 'Reporte de Usuario',
            subtitle: `Generado el ${new Date().toLocaleDateString('es-CR')}`,
            content: [
                {
                    type: 'text',
                    data: `Información del Usuario:`
                },
                {
                    type: 'line',
                    data: null
                },
                {
                    type: 'text',
                    data: `Nombre: ${userData.uName} ${userData.uFLastName} ${userData.uSLastName || ''}`
                },
                {
                    type: 'text',
                    data: `Email: ${userData.uEmail}`
                },
                {
                    type: 'text',
                    data: `Identificación: ${userData.uIdentification}`
                },
                {
                    type: 'text',
                    data: `Rol: ${userData.role?.rName || 'No especificado'}`
                },
                {
                    type: 'text',
                    data: `Estado: ${userData.uIsActive ? 'Activo' : 'Inactivo'}`
                },
                {
                    type: 'text',
                    data: `Fecha de Creación: ${new Date(userData.createAt).toLocaleDateString('es-CR')}`
                }
            ]
        };

        return this.generatePDF(content, res);
    }
}