class KeyMapper {
    static loadKeyMappings(keys : Object, mappings : Object, inputActions : Object) {
        for (var mapper in mappings) {
            var mappedInputAction = inputActions[mappings[mapper]];
            if (typeof mappedInputAction !== 'undefined') {
                keys[mapper] = mappedInputAction;
            } else {
                console.warn('Unable to find ' + mappings[mapper] + ' mapping in input actions');
            }
        }
        console.info('Key Mappings Loaded');
    }
}