const codeResponse = {
   ERR_DUPLICATE_NAME: (name: string) => `ERROR: ${name} is already exist `,
   ERR_NOT_FOUND: (name: string) => `ERROR: ${name} not found`,
   ERR_INVALID_VALUE: (name: string) => `ERROR: ${name} is invalid`,
   ERR_INVALID_FORMAT: (name: string) => `ERROR: ${name} is invalid format`,
   ERR_INVALID_FORMAT_DATE: 'ERROR: Invalid date format',
   ERR_INVALID_FORMAT_NUMBER: 'ERROR: Invalid number format',
   ERR_INVALID_FORMAT_EMAIL: 'ERROR: Invalid email format',
   ERR_INVALID_FORMAT_PHONE: 'ERROR: Invalid phone format',
};

export default codeResponse;
