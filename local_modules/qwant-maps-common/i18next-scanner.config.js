module.exports = {
    output: '.',
    options: {
        removeUnusedKeys: true,
        func: {
            list: ['_'],
            extensions: ['.js', '.jsx']
        },
        lngs: ['en','fr','de','es','it','br','ca'],
        ns: ['resource'],
        defaultLng: 'en',
        defaultNs: 'resource',
        defaultValue: function(lng, ns, key) {
            if (lng === 'en') {
                // Return key as the default value for English language
                return key;
            }
            return '';
        },
        resource: {
            loadPath: 'i18n/{{lng}}/{{ns}}.json',
            savePath: 'i18n/{{lng}}/{{ns}}.json',
            jsonIndent: 2,
            lineEnding: '\n'
        },
        nsSeparator: false, // namespace separator
        keySeparator: false, // key separator
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
