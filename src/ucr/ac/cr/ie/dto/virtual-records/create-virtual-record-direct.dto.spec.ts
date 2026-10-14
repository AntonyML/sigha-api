import { beforeAll, describe, expect, it, mock } from 'bun:test';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// The domain barrel pulls TypeORM entities with circular imports
// (Program <-> SubProgram), so stub the enums it re-exports.
// Values mirror the real enum members used by the DTO decorators.
const MaritalStatus = {
    SINGLE: 'single',
    MARRIED: 'married',
    DIVORCED: 'divorced',
    WIDOWED: 'widowed',
    COMMON_LAW_UNION: 'common law union',
    SEPARATED: 'separated',
    NOT_SPECIFIED: 'not specified',
};
const YearsSchooling = {
    NO_SCHOOLING: 'no schooling',
    INCOMPLETE_PRIMARY: 'incomplete primary',
    COMPLETE_PRIMARY: 'complete primary',
    INCOMPLETE_SECONDARY: 'incomplete secondary',
    COMPLETE_SECONDARY: 'complete secondary',
    TECHNICAL_DEGREE: 'technical degree',
    INCOMPLETE_UNIVERSITY: 'incomplete university',
    COMPLETE_UNIVERSITY: 'complete university',
    UNIVERSITY: 'university',
    POSTGRADUATE: 'postgraduate',
    NOT_SPECIFIED: 'not specified',
};
const Gender = { MALE: 'male', FEMALE: 'female', NOT_SPECIFIED: 'not specified' };
const BloodType = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    UNKNOWN: 'UNKNOWN',
};
const KinshipType = {
    SON: 'son',
    DAUGHTER: 'daughter',
    GRANDSON: 'grandson',
    GRANDDAUGHTER: 'granddaughter',
    BROTHER: 'brother',
    SISTER: 'sister',
    NEPHEW: 'nephew',
    NIECE: 'niece',
    HUSBAND: 'husband',
    WIFE: 'wife',
    LEGAL_GUARDIAN: 'legal guardian',
    OTHER: 'other',
    NOT_SPECIFIED: 'not specified',
};
const OlderAdultStatus = { ALIVE: 'alive', DEAD: 'dead' };
const TreatmentType = { TEMPORARY: 'temporary', CHRONIC: 'chronic', PREVENTIVE: 'preventive', OTHER: 'other' };

mock.module('../../domain/virtual-records', () => ({
    MaritalStatus,
    YearsSchooling,
    Gender,
    BloodType,
    KinshipType,
    OlderAdultStatus,
    TreatmentType,
}));

let CreateVirtualRecordDirectDto: typeof import('./create-virtual-record-direct.dto').CreateVirtualRecordDirectDto;

beforeAll(async () => {
    ({ CreateVirtualRecordDirectDto } = await import('./create-virtual-record-direct.dto'));
});

function buildValidPayload(): Record<string, any> {
    return {
        oa_identification: '101230456',
        oa_name: 'Juan',
        oa_f_last_name: 'Perez',
        oa_s_last_name: 'Gomez',
        oa_birthdate: '1950-01-01',
        oa_marital_status: 'single',
        oa_years_schooling: 'complete primary',
        oa_previous_work: 'Agricultor',
        oa_is_retired: true,
        oa_has_pension: false,
        oa_other: false,
        oa_children_count: 2,
        oa_status: 'alive',
        oa_economic_income: 100000,
        oa_gender: 'male',
        oa_blood_type: 'O+',
        program: { id: 1 },
        family: {
            pf_identification: '202340567',
            pf_name: 'Maria',
            pf_f_last_name: 'Lopez',
            pf_s_last_name: 'Diaz',
            pf_phone_number: '8888-8888',
            pf_email: 'maria@example.com',
            pf_kinship: 'daughter',
        },
    };
}

async function validatePayload(payload: Record<string, any>) {
    const dto = plainToInstance(CreateVirtualRecordDirectDto, payload);
    return validate(dto);
}

function allMessages(errors: any[]): string[] {
    const out: string[] = [];
    const walk = (list: any[]) => {
        for (const e of list) {
            if (e.constraints) out.push(...(Object.values(e.constraints) as string[]));
            if (e.children?.length) walk(e.children);
        }
    };
    walk(errors);
    return out;
}

describe('CreateVirtualRecordDirectDto - required and conditional validation', () => {
    it('passes with a complete valid payload', async () => {
        const errors = await validatePayload(buildValidPayload());
        expect(errors).toHaveLength(0);
    });

    it('fails when family is missing', async () => {
        const payload = buildValidPayload();
        delete payload.family;
        const messages = allMessages(await validatePayload(payload));
        expect(messages).toContain('Family information is required');
    });

    it('fails when family email is missing', async () => {
        const payload = buildValidPayload();
        delete payload.family.pf_email;
        const messages = allMessages(await validatePayload(payload));
        expect(messages).toContain('Family email is required');
    });

    it('fails when family phone is missing', async () => {
        const payload = buildValidPayload();
        delete payload.family.pf_phone_number;
        const messages = allMessages(await validatePayload(payload));
        expect(messages).toContain('Family phone number is required');
    });

    it('fails when program id is missing', async () => {
        const payload = buildValidPayload();
        payload.program = {};
        const errors = await validatePayload(payload);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('requires oa_other_description only when oa_other is true', async () => {
        const missing = buildValidPayload();
        missing.oa_other = true;
        expect(allMessages(await validatePayload(missing))).toContain(
            'Other income description is required when other income is indicated',
        );

        const notNeeded = buildValidPayload();
        notNeeded.oa_other = false;
        expect(await validatePayload(notNeeded)).toHaveLength(0);

        const provided = buildValidPayload();
        provided.oa_other = true;
        provided.oa_other_description = 'Venta de abarrotes';
        expect(await validatePayload(provided)).toHaveLength(0);
    });

    it('requires oa_death_date only when status is dead', async () => {
        const missing = buildValidPayload();
        missing.oa_status = 'dead';
        expect(allMessages(await validatePayload(missing))).toContain(
            'Death date is required when status is dead',
        );

        const alive = buildValidPayload();
        alive.oa_status = 'alive';
        expect(await validatePayload(alive)).toHaveLength(0);

        const dead = buildValidPayload();
        dead.oa_status = 'dead';
        dead.oa_death_date = '2024-05-01';
        expect(await validatePayload(dead)).toHaveLength(0);
    });

    it('requires neoplasms description only when neoplasms are indicated', async () => {
        const missing = buildValidPayload();
        missing.clinical_history = { ch_frequent_falls: false, ch_neoplasms: true, ch_vision_problems: false, ch_vision_hearing: false };
        expect(allMessages(await validatePayload(missing))).toContain(
            'Neoplasms description is required when neoplasms are indicated',
        );

        const provided = buildValidPayload();
        provided.clinical_history = { ch_frequent_falls: false, ch_neoplasms: true, ch_neoplasms_description: 'En seguimiento', ch_vision_problems: false, ch_vision_hearing: false };
        expect(await validatePayload(provided)).toHaveLength(0);
    });
});
