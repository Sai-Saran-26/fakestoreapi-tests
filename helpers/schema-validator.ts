import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export function validateSchema(schema: object,data: unknown,) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return {
        valid,
        errors: validate.errors ?? null,
    };
}

export function assertSchema(schema: object, data: unknown, label = 'response') {
    const { valid, errors } = validateSchema(schema, data);
    if (!valid) {
    const messages = (errors ?? [])
      .map(e => `  ${e.instancePath || '(root)'} ${e.message}`)
      .join('\n');
    throw new Error(`Schema validation failed for ${label}:\n${messages}`);
  }
}

