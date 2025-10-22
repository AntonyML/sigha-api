import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EntranceExit, EntranceExitType, AccessType } from '../../domain/entrances-exits/entrance-exit.entity';
import { CreateEntranceExitDto, UpdateEntranceExitDto, SearchEntranceExitDto, CloseCycleDto } from '../../dto/entrances-exits';
import { SuccessResponse } from '../../interfaces';

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
     * Obtener todos los registros
     */
    async findAll(): Promise<EntranceExit[]> {
        return await this.entranceExitRepository.find({
            order: { createAt: 'DESC' }
        });
    }

    /**
     * Obtener registro por ID
     */
    async findOne(id: number): Promise<EntranceExit> {
        const entranceExit = await this.entranceExitRepository.findOne({
            where: { id }
        });

        if (!entranceExit) {
            throw new NotFoundException('Registro no encontrado');
        }

        return entranceExit;
    }

    /**
     * Actualizar registro
     */
    async update(id: number, updateEntranceExitDto: UpdateEntranceExitDto): Promise<EntranceExit> {
        const entranceExit = await this.findOne(id);

        // Validaciones de negocio para actualizaciones
        if (updateEntranceExitDto.eeAccessType === AccessType.ENTRANCE && updateEntranceExitDto.eeDatetimeExit) {
            throw new BadRequestException('No se puede asignar fecha de salida a un registro de entrada');
        }

        if (updateEntranceExitDto.eeAccessType === AccessType.EXIT && updateEntranceExitDto.eeDatetimeEntrance) {
            throw new BadRequestException('No se puede asignar fecha de entrada a un registro de salida');
        }

        // Actualizar propiedades
        Object.assign(entranceExit, updateEntranceExitDto);

        // Convertir fechas si vienen como string
        if (updateEntranceExitDto.eeDatetimeEntrance) {
            entranceExit.eeDatetimeEntrance = new Date(updateEntranceExitDto.eeDatetimeEntrance);
        }

        if (updateEntranceExitDto.eeDatetimeExit) {
            entranceExit.eeDatetimeExit = new Date(updateEntranceExitDto.eeDatetimeExit);
        }

        return await this.entranceExitRepository.save(entranceExit);
    }

    /**
     * Eliminar registro
     */
    async remove(id: number): Promise<SuccessResponse> {
        const entranceExit = await this.findOne(id);
        await this.entranceExitRepository.remove(entranceExit);
        return { success: true };
    }

    /**
     * Buscar registros con filtros
     */
    async search(searchDto: SearchEntranceExitDto): Promise<{
        data: EntranceExit[];
        total: number;
        page: number;
        limit: number;
    }> {
        const {
            eeType,
            eeAccessType,
            dateFrom,
            dateTo,
            eeClose,
            search,
            page = 1,
            limit = 10
        } = searchDto;

        const queryBuilder = this.entranceExitRepository.createQueryBuilder('entranceExit');

        // Filtros
        if (eeType) {
            queryBuilder.andWhere('entranceExit.eeType = :eeType', { eeType });
        }

        if (eeAccessType) {
            queryBuilder.andWhere('entranceExit.eeAccessType = :eeAccessType', { eeAccessType });
        }

        if (dateFrom) {
            queryBuilder.andWhere('entranceExit.createAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
        }

        if (dateTo) {
            queryBuilder.andWhere('entranceExit.createAt <= :dateTo', { dateTo: new Date(dateTo) });
        }

        if (typeof eeClose === 'boolean') {
            queryBuilder.andWhere('entranceExit.eeClose = :eeClose', { eeClose });
        }

        if (search) {
            queryBuilder.andWhere(
                '(entranceExit.eeName LIKE :search OR entranceExit.eeFLastName LIKE :search OR entranceExit.eeSLastName LIKE :search OR entranceExit.eeIdentification LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Paginación
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);

        // Ordenar
        queryBuilder.orderBy('entranceExit.createAt', 'DESC');

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit
        };
    }

    /**
     * Obtener personas actualmente dentro del hogar
     */
    async getCurrentlyInside(): Promise<EntranceExit[]> {
        return await this.entranceExitRepository.find({
            where: {
                eeAccessType: AccessType.ENTRANCE,
                eeClose: false
            },
            order: { eeDatetimeEntrance: 'DESC' }
        });
    }

    /**
     * Cerrar ciclo de entrada (registrar salida automática)
     */
    async closeEntranceCycle(id: number, exitTime?: Date): Promise<EntranceExit> {
        const entranceExit = await this.findOne(id);

        if (entranceExit.eeAccessType !== AccessType.ENTRANCE) {
            throw new BadRequestException('Solo se pueden cerrar ciclos de entrada');
        }

        if (entranceExit.eeClose) {
            throw new BadRequestException('El ciclo ya está cerrado');
        }

        entranceExit.eeDatetimeExit = exitTime || new Date();
        entranceExit.eeClose = true;

        return await this.entranceExitRepository.save(entranceExit);
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
     * Obtener estadísticas del día
     */
    async getDailyStats(date?: string): Promise<{
        totalEntrances: number;
        totalExits: number;
        currentlyInside: number;
        byType: Record<EntranceExitType, { entrances: number; exits: number }>;
    }> {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dayRecords = await this.entranceExitRepository.find({
            where: {
                createAt: {
                    gte: startOfDay,
                    lte: endOfDay
                } as any
            }
        });

        const totalEntrances = dayRecords.filter(r => r.eeAccessType === AccessType.ENTRANCE).length;
        const totalExits = dayRecords.filter(r => r.eeAccessType === AccessType.EXIT).length;
        
        const currentlyInside = await this.entranceExitRepository.count({
            where: {
                eeAccessType: AccessType.ENTRANCE,
                eeClose: false
            }
        });

        // Estadísticas por tipo
        const byType: Record<EntranceExitType, { entrances: number; exits: number }> = {} as any;
        
        Object.values(EntranceExitType).forEach(type => {
            const typeRecords = dayRecords.filter(r => r.eeType === type);
            byType[type] = {
                entrances: typeRecords.filter(r => r.eeAccessType === AccessType.ENTRANCE).length,
                exits: typeRecords.filter(r => r.eeAccessType === AccessType.EXIT).length
            };
        });

        return {
            totalEntrances,
            totalExits,
            currentlyInside,
            byType
        };
    }
}