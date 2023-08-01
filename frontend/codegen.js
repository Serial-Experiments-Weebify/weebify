// eslint-disable-next-line no-undef
module.exports = {
    schema: '../backend/src/schema.gql',
    documents: ['src/**/*.vue', 'src/**/*.ts'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        './src/_gql/': {
            preset: 'client',
            presetConfig: {
                gqlTagName: 'gql',
            },
            config: {
                useTypeImports: true,
            },
        },
    },
};
