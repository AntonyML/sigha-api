import { validate } from 'class-validator';
import { IsString, IsOptional, Validate } from 'class-validator';
import { IdentificationFormatConstraint } from './identification-format.validator';

// Test DTOs mirroring the real usage patterns
class TestOaDto {
  @IsString()
  @Validate(IdentificationFormatConstraint)
  oa_identification!: string;

  @IsOptional()
  @IsString()
  oa_document_type?: string;
}

class TestPfDto {
  @IsString()
  @Validate(IdentificationFormatConstraint)
  pfIdentification!: string;

  @IsOptional()
  @IsString()
  pfDocumentType?: string;
}

describe('IdentificationFormatConstraint', () => {
  // Case a: pasaporte, AB1234567 → PASS (ICAO alphanumeric, 9 chars)
  it('a) pasaporte + AB1234567 → pass', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = 'AB1234567';
    dto.oa_document_type = 'pasaporte';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // Case b: pasaporte, 123456789 → PASS (digits are valid ICAO too)
  it('b) pasaporte + 123456789 → pass', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = '123456789';
    dto.oa_document_type = 'pasaporte';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // Case c: nacional, AB1234567 → FAIL (letters not allowed for nacional)
  it('c) nacional + AB1234567 → fail', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = 'AB1234567';
    dto.oa_document_type = 'nacional';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('oa_identification');
  });

  // Case d: undefined (legacy), 123456789 → PASS (retrocompat)
  it('d) doc_type undefined + 123456789 → pass', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = '123456789';
    // oa_document_type not set
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // Additional: nacional + letters → fail
  it('nacional + ABC → fail (letters in nacional field)', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = 'ABC';
    dto.oa_document_type = 'nacional';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  // Additional: pasaporte + too short → fail
  it('pasaporte + AB12 → fail (shorter than 6 chars)', async () => {
    const dto = new TestPfDto();
    dto.pfIdentification = 'AB12';
    dto.pfDocumentType = 'pasaporte';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });

  // Additional: dimex + only digits → pass
  it('dimex + 12345678901 → pass', async () => {
    const dto = new TestOaDto();
    dto.oa_identification = '12345678901';
    dto.oa_document_type = 'dimex';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // Additional: pfIdentification with pfDocumentType pasaporte
  it('family pasaporte + AB123456 → pass', async () => {
    const dto = new TestPfDto();
    dto.pfIdentification = 'AB123456';
    dto.pfDocumentType = 'pasaporte';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
