import { 
    IsString, 
    IsOptional, 
    IsNumber, 
    IsBoolean, 
    IsEmail, 
    IsArray, 
    ValidateNested, 
    IsEnum, 
    IsDateString,
    IsNotEmpty,
    Length,
    Min,
    Max,
    IsPositive,
    Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MaritalStatus, YearsSchooling, Gender, BloodType, KinshipType, OlderAdultStatus, TreatmentType } from '../../domain/virtual-records';

export class UpdateSubProgramDataDto {
    @ApiProperty({ description: 'Sub program ID' })
    @IsNumber()
    @IsPositive({ message: 'Sub program ID must be a positive number' })
    id: number;
}

export class UpdateProgramDataDto {
    @ApiProperty({ description: 'Program ID', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive({ message: 'Program ID must be a positive number' })
    id?: number;

    @ApiProperty({ description: 'Sub programs', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateSubProgramDataDto)
    sub_programs?: UpdateSubProgramDataDto[];
}

export class UpdateFamilyDataDto {
    @ApiProperty({ description: 'Family identification number' })
    @IsString()
    @IsNotEmpty({ message: 'Family identification is required' })
    @Length(9, 15, { message: 'Identification must be between 9 and 15 characters' })
    pf_identification: string;

    @ApiProperty({ description: 'First name' })
    @IsString()
    @IsNotEmpty({ message: 'Family first name is required' })
    @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
    pf_name: string;

    @ApiProperty({ description: 'First last name' })
    @IsString()
    @IsNotEmpty({ message: 'Family first last name is required' })
    @Length(2, 50, { message: 'First last name must be between 2 and 50 characters' })
    pf_f_last_name: string;

    @ApiProperty({ description: 'Second last name' })
    @IsString()
    @IsNotEmpty({ message: 'Family second last name is required' })
    @Length(2, 50, { message: 'Second last name must be between 2 and 50 characters' })
    pf_s_last_name: string;

    @ApiProperty({ description: 'Phone number', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9-+\s()]+$/, { message: 'Phone number format is invalid' })
    pf_phone_number?: string;

    @ApiProperty({ description: 'Email address', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    pf_email?: string;

    @ApiProperty({ 
        description: 'Relationship to older adult',
        enum: KinshipType 
    })
    @IsString()
    @IsEnum(KinshipType, { message: 'Invalid kinship type' })
    pf_kinship: string;
}

export class UpdateClinicalConditionDataDto {
    @ApiProperty({ description: 'Clinical condition ID' })
    @IsNumber()
    @IsPositive({ message: 'Clinical condition ID must be a positive number' })
    id: number;
}

export class UpdateVaccineDataDto {
    @ApiProperty({ description: 'Vaccine ID' })
    @IsNumber()
    @IsPositive({ message: 'Vaccine ID must be a positive number' })
    id: number;
}

export class UpdateMedicationDataDto {
    @ApiProperty({ description: 'Medication name' })
    @IsString()
    @IsNotEmpty({ message: 'Medication name is required' })
    @Length(2, 500, { message: 'Medication name must be between 2 and 500 characters' })
    m_medication: string;

    @ApiProperty({ description: 'Medication dosage' })
    @IsString()
    @IsNotEmpty({ message: 'Medication dosage is required' })
    @Length(1, 255, { message: 'Medication dosage must be between 1 and 255 characters' })
    m_dosage: string;

    @ApiProperty({ 
        description: 'Treatment type',
        enum: TreatmentType
    })
    @IsString()
    @IsEnum(TreatmentType, { message: 'Invalid treatment type' })
    m_treatment_type: string;
}

export class UpdateClinicalHistoryDataDto {
    @ApiProperty({ description: 'Has frequent falls' })
    @IsBoolean({ message: 'Frequent falls field must be a boolean' })
    ch_frequent_falls: boolean;

    @ApiProperty({ description: 'Weight in kg', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'Weight must be a number' })
    @Min(1, { message: 'Weight must be at least 1 kg' })
    @Max(500, { message: 'Weight cannot exceed 500 kg' })
    ch_weight?: number;

    @ApiProperty({ description: 'Height in meters', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'Height must be a number' })
    @Min(0.5, { message: 'Height must be at least 0.5 meters' })
    @Max(3, { message: 'Height cannot exceed 3 meters' })
    ch_height?: number;

    @ApiProperty({ description: 'Body Mass Index', required: false })
    @IsOptional()
    @IsNumber({}, { message: 'BMI must be a number' })
    @Min(10, { message: 'BMI must be at least 10' })
    @Max(100, { message: 'BMI cannot exceed 100' })
    ch_imc?: number;

    @ApiProperty({ description: 'Blood pressure reading', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^\d{2,3}\/\d{2,3}$/, { message: 'Blood pressure must be in format XXX/XXX' })
    ch_blood_pressure?: string;

    @ApiProperty({ description: 'Has neoplasms' })
    @IsBoolean({ message: 'Neoplasms field must be a boolean' })
    ch_neoplasms: boolean;

    @ApiProperty({ description: 'Neoplasms description', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 1000, { message: 'Neoplasms description cannot exceed 1000 characters' })
    ch_neoplasms_description?: string;

    @ApiProperty({ description: 'General observations', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 2000, { message: 'Observations cannot exceed 2000 characters' })
    ch_observations?: string;

    @ApiProperty({ description: 'RCVG assessment', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 100, { message: 'RCVG assessment cannot exceed 100 characters' })
    ch_rcvg?: string;

    @ApiProperty({ description: 'Has vision problems' })
    @IsBoolean({ message: 'Vision problems field must be a boolean' })
    ch_vision_problems: boolean;

    @ApiProperty({ description: 'Has hearing problems' })
    @IsBoolean({ message: 'Hearing problems field must be a boolean' })
    ch_vision_hearing: boolean;

    @ApiProperty({ description: 'Create date', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format. Use ISO date format' })
    create_at?: string;

    @ApiProperty({ description: 'List of clinical conditions (can be empty)', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateClinicalConditionDataDto)
    clinical_conditions?: UpdateClinicalConditionDataDto[];

    @ApiProperty({ description: 'List of vaccines (can be empty)', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateVaccineDataDto)
    vaccines?: UpdateVaccineDataDto[];

    @ApiProperty({ description: 'List of medications (can be empty)', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateMedicationDataDto)
    medications?: UpdateMedicationDataDto[];
}

export class UpdateVirtualRecordDirectDto {
    @ApiProperty({ description: 'Older adult ID to update' })
    @IsNumber()
    @IsPositive({ message: 'ID must be a positive number' })
    id: number;

    @ApiProperty({ description: 'Older adult identification number' })
    @IsString()
    @IsNotEmpty({ message: 'Identification is required' })
    @Length(9, 15, { message: 'Identification must be between 9 and 15 characters' })
    oa_identification: string;

    @ApiProperty({ description: 'First name' })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
    oa_name: string;

    @ApiProperty({ description: 'First last name' })
    @IsString()
    @IsNotEmpty({ message: 'First last name is required' })
    @Length(2, 50, { message: 'First last name must be between 2 and 50 characters' })
    oa_f_last_name: string;

    @ApiProperty({ description: 'Second last name', required: false })
    @IsOptional()
    @IsString()
    @Length(2, 50, { message: 'Second last name must be between 2 and 50 characters' })
    oa_s_last_name?: string;

    @ApiProperty({ description: 'Birthdate in ISO format', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format. Use ISO date format (YYYY-MM-DD)' })
    oa_birthdate?: string;

    @ApiProperty({ 
        description: 'Marital status',
        enum: MaritalStatus
    })
    @IsString()
    @IsEnum(MaritalStatus, { message: 'Invalid marital status' })
    oa_marital_status: string;

    @ApiProperty({ description: 'Dwelling information', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500, { message: 'Dwelling information cannot exceed 500 characters' })
    oa_dwelling?: string;

    @ApiProperty({ 
        description: 'Years of schooling',
        enum: YearsSchooling
    })
    @IsString()
    @IsEnum(YearsSchooling, { message: 'Invalid years of schooling' })
    oa_years_schooling: string;

    @ApiProperty({ description: 'Previous work experience' })
    @IsString()
    @IsNotEmpty({ message: 'Previous work experience is required' })
    @Length(2, 200, { message: 'Previous work must be between 2 and 200 characters' })
    oa_previous_work: string;

    @ApiProperty({ description: 'Is retired' })
    @IsBoolean({ message: 'Retirement status must be a boolean' })
    oa_is_retired: boolean;

    @ApiProperty({ description: 'Has pension' })
    @IsBoolean({ message: 'Pension status must be a boolean' })
    oa_has_pension: boolean;

    @ApiProperty({ description: 'Has other income source' })
    @IsBoolean({ message: 'Other income status must be a boolean' })
    oa_other: boolean;

    @ApiProperty({ description: 'Other income description', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500, { message: 'Other income description cannot exceed 500 characters' })
    oa_other_description?: string;

    @ApiProperty({ description: 'Area of origin', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 200, { message: 'Area of origin cannot exceed 200 characters' })
    oa_area_of_origin?: string;

    @ApiProperty({ description: 'Number of children' })
    @IsNumber({}, { message: 'Children count must be a number' })
    @Min(0, { message: 'Children count cannot be negative' })
    @Max(50, { message: 'Children count cannot exceed 50' })
    oa_children_count: number;

    @ApiProperty({ 
        description: 'Status of older adult',
        enum: OlderAdultStatus
    })
    @IsString()
    @IsEnum(OlderAdultStatus, { message: 'Invalid older adult status' })
    oa_status: string;

    @ApiProperty({ description: 'Death date', required: false })
    @IsOptional()
    @IsDateString({}, { message: 'Invalid death date format. Use ISO date format (YYYY-MM-DD)' })
    oa_death_date?: string;

    @ApiProperty({ description: 'Economic income' })
    @IsNumber({}, { message: 'Economic income must be a number' })
    @Min(0, { message: 'Economic income cannot be negative' })
    @Max(999999999, { message: 'Economic income is too high' })
    oa_economic_income: number;

    @ApiProperty({ description: 'Phone number', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9-+\s()]+$/, { message: 'Phone number format is invalid' })
    oa_phone_numner?: string;

    @ApiProperty({ description: 'Email address', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    oa_email?: string;

    @ApiProperty({ description: 'Profile photo URL', required: false })
    @IsOptional()
    @IsString()
    @Length(0, 500, { message: 'Profile photo URL cannot exceed 500 characters' })
    oa_profile_photo_url?: string;

    @ApiProperty({ 
        description: 'Gender',
        enum: Gender
    })
    @IsString()
    @IsEnum(Gender, { message: 'Invalid gender' })
    oa_gender: string;

    @ApiProperty({ 
        description: 'Blood type',
        enum: BloodType
    })
    @IsString()
    @IsEnum(BloodType, { message: 'Invalid blood type' })
    oa_blood_type: string;

    @ApiProperty({ description: 'Program information' })
    @ValidateNested()
    @Type(() => UpdateProgramDataDto)
    program: UpdateProgramDataDto;

    @ApiProperty({ description: 'Family information', required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateFamilyDataDto)
    family?: UpdateFamilyDataDto;

    @ApiProperty({ description: 'Clinical history information', required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateClinicalHistoryDataDto)
    clinical_history?: UpdateClinicalHistoryDataDto;
}