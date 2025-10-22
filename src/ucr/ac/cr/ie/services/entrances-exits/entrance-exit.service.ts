import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EntranceExit, EntranceExitType, AccessType } from '../../domain/entrances-exits/entrance-exit.entity';
import { CreateEntranceExitDto, CloseCycleDto } from '../../dto/entrances-exits';

@Injectable()
export class EntranceExitService {
    constructor(
        @Inject('EntranceExitRepository')
        private entranceExitRepository: Repository<EntranceExit>,
    ) { }

    /**
     * Crear un nuevo registro de entrada/salida
     */
    async create(createEntranceExitDto: CreateEntranceExitDto): Promise<EntranceExit> {
        const {
            eeType,
            eeAccessType,
            eeIdentification,
            eeName,
            eeFLastName,
            eeSLastName,
            eeDatetimeEntrance,
            eeDatetimeExit,
            eeClose,
            eeObservations
        } = createEntranceExitDto;

        // Validaciones de negocio más flexibles
        // Solo validar si viene una fecha que no corresponde al tipo de acceso
        if (eeAccessType === AccessType.ENTRANCE && eeDatetimeExit && eeDatetimeExit.trim() !== '') {
            throw new BadRequestException('No se puede registrar fecha de salida en una entrada');
        }

        if (eeAccessType === AccessType.EXIT && eeDatetimeEntrance && eeDatetimeEntrance.trim() !== '') {
            throw new BadRequestException('No se puede registrar fecha de entrada en una salida');
        }

        // Procesar fechas de manera más flexible
        let entranceDate: Date | undefined = undefined;
        let exitDate: Date | undefined = undefined;

        // Para entradas
        if (eeAccessType === AccessType.ENTRANCE) {
            if (eeDatetimeEntrance && eeDatetimeEntrance.trim() !== '') {
                entranceDate = new Date(eeDatetimeEntrance);
            } else {
                entranceDate = new Date(); // Usar fecha actual si no se especifica
            }
        }

        // Para salidas  
        if (eeAccessType === AccessType.EXIT) {
            if (eeDatetimeExit && eeDatetimeExit.trim() !== '') {
                exitDate = new Date(eeDatetimeExit);
            } else {
                exitDate = new Date(); // Usar fecha actual si no se especifica
            }
        }

        // Crear la entidad
        const entranceExit = new EntranceExit(
            0, // ID se auto-genera
            eeType,
            eeAccessType,
            eeClose || false,
            eeIdentification,
            eeName,
            eeFLastName,
            eeSLastName,
            entranceDate,
            exitDate,
            eeObservations
        );

        return await this.entranceExitRepository.save(entranceExit);
    }

    /**
     * Obtener registro por ID (usado internamente)
     */
    private async findOne(id: number): Promise<EntranceExit> {
        const entranceExit = await this.entranceExitRepository.findOne({
            where: { id }
        });

        if (!entranceExit) {
            throw new NotFoundException('Registro no encontrado');
        }

        return entranceExit;
    }

    /**
     * Cerrar ciclo completo (para administradores)
     * Permite completar la información faltante y cerrar cualquier tipo de registro
     */
    async closeCycle(id: number, closeCycleDto: CloseCycleDto): Promise<EntranceExit> {
        const { eeDatetimeEntrance, eeDatetimeExit, eeObservations, eeClose } = closeCycleDto;

        const entranceExit = await this.findOne(id);

        // Validar que el ciclo no esté ya cerrado
        if (entranceExit.eeClose) {
            throw new BadRequestException('El ciclo ya está cerrado');
        }

        // Validar que se está intentando cerrar el ciclo
        if (!eeClose) {
            throw new BadRequestException('Para cerrar un ciclo, eeClose debe ser true');
        }

        // Validaciones según el tipo de registro original
        if (entranceExit.eeAccessType === AccessType.ENTRANCE) {
            // Si era entrada, debe completar con fecha de salida
            if (!eeDatetimeExit) {
                throw new BadRequestException('Para cerrar un ciclo de entrada, debe proporcionar la fecha de salida');
            }
            if (eeDatetimeEntrance && eeDatetimeEntrance.trim() !== '') {
                throw new BadRequestException('No puede modificar la fecha de entrada en un registro que ya la tiene');
            }
            
            entranceExit.eeDatetimeExit = new Date(eeDatetimeExit);
            
        } else if (entranceExit.eeAccessType === AccessType.EXIT) {
            // Si era salida, debe completar con fecha de entrada
            if (!eeDatetimeEntrance) {
                throw new BadRequestException('Para cerrar un ciclo de salida, debe proporcionar la fecha de entrada');
            }
            if (eeDatetimeExit && eeDatetimeExit.trim() !== '') {
                throw new BadRequestException('No puede modificar la fecha de salida en un registro que ya la tiene');
            }
            
            entranceExit.eeDatetimeEntrance = new Date(eeDatetimeEntrance);
        }

        // Validar que la fecha de entrada sea anterior a la de salida
        if (entranceExit.eeDatetimeEntrance && entranceExit.eeDatetimeExit) {
            if (entranceExit.eeDatetimeEntrance >= entranceExit.eeDatetimeExit) {
                throw new BadRequestException('La fecha de entrada debe ser anterior a la fecha de salida');
            }
        }

        // Actualizar observaciones (agregar a las existentes)
        if (eeObservations && eeObservations.trim() !== '') {
            const existingObservations = entranceExit.eeObservations || '';
            const separator = existingObservations ? ' | ' : '';
            entranceExit.eeObservations = existingObservations + separator + eeObservations;
        }

        // Cerrar el ciclo
        entranceExit.eeClose = true;

        return await this.entranceExitRepository.save(entranceExit);
    }

    /**
     * Obtener registros de entrada sin cerrar (entraron pero no han salido)
     */
    async getOpenEntrances(): Promise<EntranceExit[]> {
        return await this.entranceExitRepository.find({
            where: {
                eeAccessType: AccessType.ENTRANCE,
                eeClose: false
            },
            order: { eeDatetimeEntrance: 'DESC' }
        });
    }

    /**
     * Obtener registros de salida sin cerrar (salieron pero no se registró entrada)
     */
    async getOpenExits(): Promise<EntranceExit[]> {
        return await this.entranceExitRepository.find({
            where: {
                eeAccessType: AccessType.EXIT,
                eeClose: false
            },
            order: { eeDatetimeExit: 'DESC' }
        });
    }

}