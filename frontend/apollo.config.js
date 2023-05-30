/* eslint-disable no-undef */
module.exports = {
    client: {
        service: {
            name: 'weebify-api',
            localSchemaFile: './backend/src/schema.gql',
        },
        includes: ['src/**/*.vue', 'src/**/*.ts'],
    },
};
