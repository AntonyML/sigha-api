import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

/**
 * Custom validator for identification format.
 *
 * - If document_type === 'pasaporte' (or the corresponding field on the DTO):
 *   validates against ICAO pattern ^[A-Z0-9]{6,9}$
 * - Otherwise (nacional, dimex, nite, or undefined):
 *   validates against ^[0-9]+$  (digits only)
 *
 * The document type field name is passed as a constraint argument.
 * Defaults to looking for `oa_document_type` or `pf_document_type` based on the
 * property name prefix.
 */
@ValidatorConstraint({ name: 'identificationFormat', async: false })
export class IdentificationFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    const object = args.object as Record<string, any>;
    const docTypeField = args.constraints?.[0] as string | undefined;

    // Resolve document_type field name: explicit or infer from property prefix
    const resolvedDocField =
      docTypeField ||
      (args.property.startsWith('oa_') ? 'oa_document_type' :
       args.property.startsWith('pf_') ? 'pf_document_type' :
       args.property === 'pfIdentification' ? 'pfDocumentType' :
       args.property === 'oaIdentification' ? 'oaDocumentType' :
       undefined);

    const docType = resolvedDocField ? object[resolvedDocField] : undefined;

    if (docType === 'pasaporte') {
      return /^[A-Z0-9]{6,9}$/.test(value);
    }
    // nacional, dimex, nite, undefined, or any other value → digits only
    return /^[0-9]+$/.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as Record<string, any>;
    const docTypeField = args.constraints?.[0] as string | undefined;
    const resolvedDocField =
      docTypeField ||
      (args.property.startsWith('oa_') ? 'oa_document_type' :
       args.property.startsWith('pf_') ? 'pf_document_type' :
       args.property === 'pfIdentification' ? 'pfDocumentType' :
       args.property === 'oaIdentification' ? 'oaDocumentType' :
       undefined);

    const docType = resolvedDocField ? object[resolvedDocField] : undefined;

    if (docType === 'pasaporte') {
      return 'Passport number must be 6-9 alphanumeric uppercase characters (A-Z, 0-9)';
    }
    return 'Identification must contain only digits';
  }
}