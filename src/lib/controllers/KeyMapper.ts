export class KeyMapper {
    static loadKeyMappings(keys : object, mappings : object, inputActions : object) {
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
