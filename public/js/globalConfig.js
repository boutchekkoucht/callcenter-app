(function (exports) {

    var config = {
        languages: [{
            code: 'en',
            name: 'English'
        }, {
            code: 'fr',
            name: 'French'
        }],

        typeRequests: [
        {
            code: 'Achat',
            name: 'Achat'
        }, {
            code: 'devis',
            name: 'devis'
        },
        {
            code: 'Après-Vente',
            name: 'Après-Vente'
        }, {
            code: 'Réclamation',
            name: 'Réclamation'
        } 
        ]
    }
    exports.languages = config.languages;
    exports.typeRequests = config.typeRequests;
})(typeof exports === 'undefined' ? this['CONSTANTS'] = {} : exports);