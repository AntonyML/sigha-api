import { Controller, Post, Put, Get, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VirtualRecordsService } from '../../services/virtual-records';
import { CreateVirtualRecordDirectDto, UpdateVirtualRecordDirectDto, SearchVirtualRecordsDto } from '../../dto/virtual-records';
import { OlderAdult } from '../../domain/virtual-records';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Virtual Records')
@Controller('virtual-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class VirtualRecordsController {
    constructor(private readonly virtualRecordsService: VirtualRecordsService) {}

    @Post('create')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Create a new virtual record',
        description: 'Creates a comprehensive virtual record for an older adult including program enrollment, family information, and clinical history'
    })
    @ApiResponse({
        status: 201,
        description: 'Virtual record created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record created successfully' },
                data: {
                    type: 'object',
                    description: 'Created older adult record'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 409,
        description: 'Older adult with this identification already exists'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during record creation'
    })
    async createVirtualRecord(@Body() createDto: CreateVirtualRecordDirectDto) {
        return this.virtualRecordsService.createVirtualRecordDirect(createDto);
    }

    @Put(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Update a virtual record',
        description: 'Updates a complete virtual record for an older adult. Replaces all existing data with the provided information, including program enrollment, family information, and clinical history. Arrays can be empty to clear existing data.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the older adult to update',
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Virtual record updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record updated successfully' },
                data: {
                    type: 'object',
                    description: 'Updated older adult record'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Older adult not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Identification already exists for another older adult'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during record update'
    })
    async updateVirtualRecord(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateDto: UpdateVirtualRecordDirectDto
    ) {
        updateDto.id = id;
        return this.virtualRecordsService.updateVirtualRecordDirect(updateDto);
    }

    @Get('all')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get all virtual records',
        description: 'Retrieves all virtual records with complete information including program enrollment, family information, emergency contacts, and clinical history with conditions, vaccines, and medications.'
    })
    @ApiResponse({
        status: 200,
        description: 'All virtual records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Found 15 virtual record(s)' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            oaIdentification: { type: 'string', example: '1-1234-5678' },
                            oaName: { type: 'string', example: 'María Elena' },
                            oaFLastName: { type: 'string', example: 'González' },
                            oaSLastName: { type: 'string', example: 'Rodríguez' },
                            oaBirthdate: { type: 'string', format: 'date-time', example: '1950-03-15T00:00:00.000Z' },
                            oaGender: { type: 'string', example: 'female' },
                            oaPhoneNumber: { type: 'string', example: '2234-5678' },
                            oaEmail: { type: 'string', example: 'maria.gonzalez@email.com' },
                            oaAddress: { type: 'string', example: 'San José, Costa Rica' },
                            oaEntryDate: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00.000Z' },
                            oaStatus: { type: 'string', example: 'active' },
                            program: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    pName: { type: 'string', example: 'Hogar de Larga Instancia' },
                                    pDescription: { type: 'string', example: 'Programa de cuidado integral...' },
                                    subPrograms: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                spName: { type: 'string', example: 'Cuidado General' },
                                                spDescription: { type: 'string', example: 'Atención médica y social básica' }
                                            }
                                        }
                                    }
                                }
                            },
                            family: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    pfIdentification: { type: 'string', example: '1-9876-5432' },
                                    pfName: { type: 'string', example: 'Carlos Alberto' },
                                    pfFLastName: { type: 'string', example: 'González' },
                                    pfSLastName: { type: 'string', example: 'Mora' },
                                    pfKinship: { type: 'string', example: 'son' },
                                    pfPhoneNumber: { type: 'string', example: '8765-4321' },
                                    pfEmail: { type: 'string', example: 'carlos.gonzalez@email.com' },
                                    emergencyContacts: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                ecName: { type: 'string', example: 'Ana María González' },
                                                ecKinship: { type: 'string', example: 'daughter' },
                                                ecPhoneNumber: { type: 'string', example: '8888-9999' }
                                            }
                                        }
                                    }
                                }
                            },
                            clinicalHistory: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    chBloodType: { type: 'string', example: 'O+' },
                                    chAllergies: { type: 'string', example: 'Penicilina, mariscos' },
                                    chEmergencyObservations: { type: 'string', example: 'Dificultad para caminar sin ayuda' },
                                    conditions: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                ccName: { type: 'string', example: 'HTA' },
                                                ccDescription: { type: 'string', example: 'Hipertensión arterial' }
                                            }
                                        }
                                    },
                                    vaccines: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                vName: { type: 'string', example: 'dT' },
                                                vDescription: { type: 'string', example: 'Difteria y Tétanos' }
                                            }
                                        }
                                    },
                                    medications: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                mMedication: { type: 'string', example: 'Losartán 50mg' },
                                                mDosage: { type: 'string', example: '1 tableta cada 12 horas' },
                                                mTreatmentType: { type: 'string', example: 'chronic' },
                                                mStartDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
                                                mObservations: { type: 'string', example: 'Tomar con alimentos' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while retrieving records'
    })
    async getAllVirtualRecords() {
        return this.virtualRecordsService.getAllVirtualRecords();
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Delete a virtual record',
        description: 'Permanently deletes a virtual record and all its related data including family information, clinical history, medications, condition associations, and vaccine associations. Master data (programs, sub-programs, vaccines, and clinical conditions) are preserved as they may be used by other records.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the older adult record to delete',
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Virtual record deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record deleted successfully' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Older adult not found'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during record deletion'
    })
    async deleteVirtualRecord(@Param('id', ParseIntPipe) id: number) {
        return this.virtualRecordsService.deleteVirtualRecord(id);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get virtual record by ID',
        description: 'Retrieves a specific virtual record by ID with complete information including program enrollment, family information, emergency contacts, and clinical history with conditions, vaccines, and medications.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the older adult record to retrieve',
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Virtual record found successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record found successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        oaIdentification: { type: 'string', example: '1-1234-5678' },
                        oaName: { type: 'string', example: 'María Elena' },
                        oaFLastName: { type: 'string', example: 'González' },
                        oaSLastName: { type: 'string', example: 'Rodríguez' },
                        oaBirthdate: { type: 'string', format: 'date-time', example: '1950-03-15T00:00:00.000Z' },
                        oaGender: { type: 'string', example: 'female' },
                        oaPhoneNumber: { type: 'string', example: '2234-5678' },
                        oaEmail: { type: 'string', example: 'maria.gonzalez@email.com' },
                        oaAddress: { type: 'string', example: 'San José, Costa Rica' },
                        oaEntryDate: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00.000Z' },
                        oaStatus: { type: 'string', example: 'active' },
                        oaMaritalStatus: { type: 'string', example: 'married' },
                        oaYearsSchooling: { type: 'string', example: 'complete_primary' },
                        oaPreviousWork: { type: 'string', example: 'Maestra de escuela' },
                        oaIsRetired: { type: 'boolean', example: true },
                        oaHasPension: { type: 'boolean', example: true },
                        oaOther: { type: 'boolean', example: false },
                        oaOtherDescription: { type: 'string', example: null },
                        oaAreaOfOrigin: { type: 'string', example: 'San José' },
                        oaChildrenCount: { type: 'number', example: 2 },
                        oaDeathDate: { type: 'string', format: 'date-time', example: null },
                        oaEconomicIncome: { type: 'number', example: 350000 },
                        oaProfilePhotoUrl: { type: 'string', example: null },
                        oaBloodType: { type: 'string', example: 'O+' },
                        program: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                pName: { type: 'string', example: 'Hogar de Larga Instancia' },
                                subPrograms: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            spName: { type: 'string', example: 'Cuidado General' }
                                        }
                                    }
                                }
                            }
                        },
                        family: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                pfIdentification: { type: 'string', example: '1-9876-5432' },
                                pfName: { type: 'string', example: 'Carlos Alberto' },
                                pfFLastName: { type: 'string', example: 'González' },
                                pfSLastName: { type: 'string', example: 'Mora' },
                                pfKinship: { type: 'string', example: 'son' },
                                pfPhoneNumber: { type: 'string', example: '8765-4321' },
                                pfEmail: { type: 'string', example: 'carlos.gonzalez@email.com' },
                                emergencyContacts: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            ecName: { type: 'string', example: 'Ana María González' },
                                            ecKinship: { type: 'string', example: 'daughter' },
                                            ecPhoneNumber: { type: 'string', example: '8888-9999' }
                                        }
                                    }
                                }
                            }
                        },
                        clinicalHistory: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                chBloodType: { type: 'string', example: 'O+' },
                                chAllergies: { type: 'string', example: 'Penicilina, mariscos' },
                                chEmergencyObservations: { type: 'string', example: 'Dificultad para caminar sin ayuda' },
                                chFrequentFalls: { type: 'boolean', example: false },
                                chWeight: { type: 'number', example: 65.5 },
                                chHeight: { type: 'number', example: 1.62 },
                                chImc: { type: 'number', example: 24.98 },
                                chBloodPressure: { type: 'string', example: '120/80' },
                                chNeoplasms: { type: 'boolean', example: false },
                                chNeoplasmsDescription: { type: 'string', example: null },
                                chObservations: { type: 'string', example: 'Paciente estable' },
                                chRcvg: { type: 'string', example: 'good' },
                                chVisionProblems: { type: 'boolean', example: true },
                                chVisionHearing: { type: 'boolean', example: false },
                                conditions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            ccName: { type: 'string', example: 'HTA' }
                                        }
                                    }
                                },
                                vaccines: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            vName: { type: 'string', example: 'dT' }
                                        }
                                    }
                                },
                                medications: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            mMedication: { type: 'string', example: 'Losartán 50mg' },
                                            mDosage: { type: 'string', example: '1 tableta cada 12 horas' },
                                            mTreatmentType: { type: 'string', example: 'chronic' },
                                            mStartDate: { type: 'string', format: 'date-time', example: null },
                                            mObservations: { type: 'string', example: 'Tomar con alimentos' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Virtual record not found'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while retrieving record'
    })
    async getVirtualRecordById(@Param('id', ParseIntPipe) id: number) {
        return this.virtualRecordsService.getVirtualRecordById(id);
    }

    @Get('search')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Search virtual records',
        description: 'Search for virtual records using a single search term that will be matched against identification, name, and last names. Returns complete information including program, family, emergency contacts, and clinical history with conditions, vaccines, and medications.'
    })
    @ApiQuery({
        name: 'search',
        description: 'Search term to find by identification, name, or last names (e.g., "María", "González", "1-1234", etc.)',
        required: true,
        type: 'string',
        example: 'María González'
    })
    @ApiResponse({
        status: 200,
        description: 'Virtual records found successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Found 2 virtual record(s) matching "María González"' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            oaIdentification: { type: 'string', example: '1-1234-5678' },
                            oaName: { type: 'string', example: 'María Elena' },
                            oaFLastName: { type: 'string', example: 'González' },
                            oaSLastName: { type: 'string', example: 'Rodríguez' },
                            program: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    pName: { type: 'string', example: 'Hogar de Larga Instancia' },
                                    subPrograms: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                spName: { type: 'string', example: 'Cuidado General' }
                                            }
                                        }
                                    }
                                }
                            },
                            family: {
                                type: 'object',
                                properties: {
                                    pfIdentification: { type: 'string', example: '1-9876-5432' },
                                    pfName: { type: 'string', example: 'Carlos Alberto' },
                                    pfKinship: { type: 'string', example: 'son' }
                                }
                            },
                            clinicalHistory: {
                                type: 'object',
                                properties: {
                                    conditions: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                ccName: { type: 'string', example: 'HTA' }
                                            }
                                        }
                                    },
                                    vaccines: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                vName: { type: 'string', example: 'dT' }
                                            }
                                        }
                                    },
                                    medications: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'number', example: 1 },
                                                mMedication: { type: 'string', example: 'Losartán 50mg' },
                                                mDosage: { type: 'string', example: '1 tableta cada 12 horas' },
                                                mTreatmentType: { type: 'string', example: 'chronic' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or missing search term'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during search'
    })
    async searchVirtualRecords(@Query() searchDto: SearchVirtualRecordsDto) {
        return this.virtualRecordsService.searchVirtualRecords(searchDto);
    }
}