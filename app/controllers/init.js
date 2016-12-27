var _ = require('underscore'),
    async = require('async'),
    mongoose = require('mongoose');

module.exports = {

    config : function(mongoose, next) {
        require('../models/Config')(mongoose);
        var Config = mongoose.model('Config');
        var data = require('../../config/settings');
        Config.findOne(function(err,config){
            if(!err){
                if(!config){
                    new Config({config : data}).save(function(err){
                        if(!err){
                            global.CONFIG = data;
                        }
                        next(err);
                    });
                } else {
                    var conf = config.toObject().config;
                    _.each(data,function(value,key){
                        if(!conf.hasOwnProperty(key)){
                            conf[key] = value;
                        }
                    })
                    config.config = conf;
                    config.save(function(err){
                        if(!err){
                            global.CONFIG = config.config;
                        }
                        next(err);
                    });
                }
            } else {
                next(err);
            }
        })
    },

    seed : function(){
        var Country = mongoose.model('Country'),
            Language = mongoose.model('Language'),
            Entity = mongoose.model('Entity'),
            User = mongoose.model('User');
            Role = mongoose.model('Role');

        console.log('Run seed...');
        // Populate Countries

        /*Country.remove(function(err){
            if(!err){
                var countries = getCountries();
                async.map(countries,function(country,cb){
                    new Country(country).save(function(err){
                        cb(err);
                    });
                },function(err){
                    if(err){
                        console.log('Error country : ',err);
                    } else {
                        console.log('Countries inserted.');
                    }
                })
            }
        })

        // Populate Languages
        Language.remove(function(err){
            if(!err){
                var languages = getLanguages();
                async.map(languages,function(language,cb){
                    new Language(language).save(function(err){
                        cb(err);
                    });
                },function(err){
                    if(err){
                        console.log('Error language : ',err);
                    } else {
                        console.log('Languages inserted.');
                    }
                })
            }
        })*/

        async.parallel([
                function(callback){
                    // Populate Roles
                    callback(null);
                    /*Role.remove(function(err){
                        if(!err){
                            var allRights = [];
                            _.each(global.CONFIG.rights,function(right){
                                allRights = _.union(allRights, _.map(right.actions,function(action){
                                    return action.code;
                                }));
                            })
                            var roles = [{
                                "name" : "ROLE_SUPER_ADMIN",
                                "rights" : allRights
                            },{
                                "name" : "Admin",
                                "rights" : allRights,
                                "entity" : "SANOFI",
                                "active" : true,
                                "country" : null
                            }];
                            async.map(roles,function(role,cb){
                                new Role(role).save(function(err){
                                    cb(err,role);
                                });
                            },function(err,roles){
                                if(err){
                                    console.log('Error role : ',err);
                                } else {
                                    callback(null);
                                    console.log('Roles inserted.');
                                }
                            })
                        }
                    })*/
                },
                function(callback){
                    callback(null);
                    // populate Entity : SANOFI
                    /*Entity.findOne({type : 'SANOFI'},function(err,sanofi){
                        if(!sanofi){
                            new Entity({
                                name : "Sanofi Pasteur",
                                legalId : "",
                                sapRef : "",
                                type : "SANOFI",
                                address : {},
                                contacts : {}
                            }).save(function(err){
                                    if(err){
                                        console.log('Error sanofi : ',err);
                                    } else {
                                        console.log('Entity sanofi inserted.');
                                        callback(null);
                                    }
                                })
                        } else {
                            callback(null);
                        }
                    })*/
                }
            ],
            function(err){
                //Populate Users : Super Admin (Sanofi)
                async.parallel([
                        function(callback){
                            Role.findOne({name : 'Admin'},function(err,role){
                                if(!role){
                                    var allRights = [];
                                    _.each(global.CONFIG.rights,function(right){
                                        allRights = _.union(allRights, _.map(right.actions,function(action){
                                            return action.code;
                                        }));
                                    })
                                    var role = {
                                        "name" : "Admin",
                                        "rights" : allRights,
                                        "entity" : "SANOFI",
                                        "active" : true,
                                        "country" : null
                                    };
                                    new Role(role).save(function(err,role){
                                            callback(err,role);
                                    })
                                }
                            })
                        },
                        function(callback){
                          /*  Entity.findOne({type : 'SANOFI'},function(err,entity){
                                callback(err,entity);
                            })*/
                            callback(err,null);
                        }
                    ],
                    function(err, results){
                        User.findOne({role : results[0]._id},function(err,user){
                            if(!err){
                                if(!user){
                                    var user = new User({
                                        firstName: "SUPER",
                                        lastName: "Admin",
                                        email : "super@admin.fr",
                                        phone : "",
                                        active : true,
                                        role: results[0]._id,
                                        //entity : results[1]._id,
                                        country : null,
                                        superAdmin : true
                                    });
                                    user.password = user.generateHash('123456')
                                    user.save(function(err){
                                            if(!err){
                                                console.log('Users inserted.');
                                            } else {
                                                console.log('Error user : ',err);
                                            }
                                    });
                                }
                            } else {
                                console.log('Error user : ',err);
                            }
                        })
                    });
            });
    }
}


function getCountries(){
    var countries =  {
        "AD": {
            "name": "Andorra",
            "native": "Andorra",
            "phone": "376",
            "continent": "EU",
            "capital": "Andorra la Vella",
            "currency": "EUR",
            "languages": "ca"
        },
        "AE": {
            "name": "United Arab Emirates",
            "native": "دولة الإمارات العربية المتحدة",
            "phone": "971",
            "continent": "AS",
            "capital": "Abu Dhabi",
            "currency": "AED",
            "languages": "ar"
        },
        "AF": {
            "name": "Afghanistan",
            "native": "افغانستان",
            "phone": "93",
            "continent": "AS",
            "capital": "Kabul",
            "currency": "AFN",
            "languages": "ps,uz,tk"
        },
        "AG": {
            "name": "Antigua and Barbuda",
            "native": "Antigua and Barbuda",
            "phone": "1268",
            "continent": "NA",
            "capital": "Saint John's",
            "currency": "XCD",
            "languages": "en"
        },
        "AI": {
            "name": "Anguilla",
            "native": "Anguilla",
            "phone": "1264",
            "continent": "NA",
            "capital": "The Valley",
            "currency": "XCD",
            "languages": "en"
        },
        "AL": {
            "name": "Albania",
            "native": "Shqipëria",
            "phone": "355",
            "continent": "EU",
            "capital": "Tirana",
            "currency": "ALL",
            "languages": "sq"
        },
        "AM": {
            "name": "Armenia",
            "native": "Հայաստան",
            "phone": "374",
            "continent": "AS",
            "capital": "Yerevan",
            "currency": "AMD",
            "languages": "hy,ru"
        },
        "AO": {
            "name": "Angola",
            "native": "Angola",
            "phone": "244",
            "continent": "AF",
            "capital": "Luanda",
            "currency": "AOA",
            "languages": "pt"
        },
        "AQ": {
            "name": "Antarctica",
            "native": "",
            "phone": "",
            "continent": "AN",
            "capital": "",
            "currency": "",
            "languages": ""
        },
        "AR": {
            "name": "Argentina",
            "native": "Argentina",
            "phone": "54",
            "continent": "SA",
            "capital": "Buenos Aires",
            "currency": "ARS",
            "languages": "es,gn"
        },
        "AS": {
            "name": "American Samoa",
            "native": "American Samoa",
            "phone": "1684",
            "continent": "OC",
            "capital": "Pago Pago",
            "currency": "USD",
            "languages": "en,sm"
        },
        "AT": {
            "name": "Austria",
            "native": "Österreich",
            "phone": "43",
            "continent": "EU",
            "capital": "Vienna",
            "currency": "EUR",
            "languages": "de"
        },
        "AU": {
            "name": "Australia",
            "native": "Australia",
            "phone": "61",
            "continent": "OC",
            "capital": "Canberra",
            "currency": "AUD",
            "languages": "en"
        },
        "AW": {
            "name": "Aruba",
            "native": "Aruba",
            "phone": "297",
            "continent": "NA",
            "capital": "Oranjestad",
            "currency": "AWG",
            "languages": "nl,pa"
        },
        "AX": {
            "name": "Åland",
            "native": "Åland",
            "phone": "358",
            "continent": "EU",
            "capital": "Mariehamn",
            "currency": "EUR",
            "languages": "sv"
        },
        "AZ": {
            "name": "Azerbaijan",
            "native": "Azərbaycan",
            "phone": "994",
            "continent": "AS",
            "capital": "Baku",
            "currency": "AZN",
            "languages": "az,hy"
        },
        "BA": {
            "name": "Bosnia and Herzegovina",
            "native": "Bosna i Hercegovina",
            "phone": "387",
            "continent": "EU",
            "capital": "Sarajevo",
            "currency": "BAM",
            "languages": "bs,hr,sr"
        },
        "BB": {
            "name": "Barbados",
            "native": "Barbados",
            "phone": "1246",
            "continent": "NA",
            "capital": "Bridgetown",
            "currency": "BBD",
            "languages": "en"
        },
        "BD": {
            "name": "Bangladesh",
            "native": "Bangladesh",
            "phone": "880",
            "continent": "AS",
            "capital": "Dhaka",
            "currency": "BDT",
            "languages": "bn"
        },
        "BE": {
            "name": "Belgium",
            "native": "België",
            "phone": "32",
            "continent": "EU",
            "capital": "Brussels",
            "currency": "EUR",
            "languages": "nl,fr,de"
        },
        "BF": {
            "name": "Burkina Faso",
            "native": "Burkina Faso",
            "phone": "226",
            "continent": "AF",
            "capital": "Ouagadougou",
            "currency": "XOF",
            "languages": "fr,ff"
        },
        "BG": {
            "name": "Bulgaria",
            "native": "България",
            "phone": "359",
            "continent": "EU",
            "capital": "Sofia",
            "currency": "BGN",
            "languages": "bg"
        },
        "BH": {
            "name": "Bahrain",
            "native": "‏البحرين",
            "phone": "973",
            "continent": "AS",
            "capital": "Manama",
            "currency": "BHD",
            "languages": "ar"
        },
        "BI": {
            "name": "Burundi",
            "native": "Burundi",
            "phone": "257",
            "continent": "AF",
            "capital": "Bujumbura",
            "currency": "BIF",
            "languages": "fr,rn"
        },
        "BJ": {
            "name": "Benin",
            "native": "Bénin",
            "phone": "229",
            "continent": "AF",
            "capital": "Porto-Novo",
            "currency": "XOF",
            "languages": "fr"
        },
        "BL": {
            "name": "Saint Barthélemy",
            "native": "Saint-Barthélemy",
            "phone": "590",
            "continent": "NA",
            "capital": "Gustavia",
            "currency": "EUR",
            "languages": "fr"
        },
        "BM": {
            "name": "Bermuda",
            "native": "Bermuda",
            "phone": "1441",
            "continent": "NA",
            "capital": "Hamilton",
            "currency": "BMD",
            "languages": "en"
        },
        "BN": {
            "name": "Brunei",
            "native": "Negara Brunei Darussalam",
            "phone": "673",
            "continent": "AS",
            "capital": "Bandar Seri Begawan",
            "currency": "BND",
            "languages": "ms"
        },
        "BO": {
            "name": "Bolivia",
            "native": "Bolivia",
            "phone": "591",
            "continent": "SA",
            "capital": "Sucre",
            "currency": "BOB,BOV",
            "languages": "es,ay,qu"
        },
        "BQ": {
            "name": "Bonaire",
            "native": "Bonaire",
            "phone": "5997",
            "continent": "NA",
            "capital": "Kralendijk",
            "currency": "USD",
            "languages": "nl"
        },
        "BR": {
            "name": "Brazil",
            "native": "Brasil",
            "phone": "55",
            "continent": "SA",
            "capital": "Brasília",
            "currency": "BRL",
            "languages": "pt"
        },
        "BS": {
            "name": "Bahamas",
            "native": "Bahamas",
            "phone": "1242",
            "continent": "NA",
            "capital": "Nassau",
            "currency": "BSD",
            "languages": "en"
        },
        "BT": {
            "name": "Bhutan",
            "native": "ʼbrug-yul",
            "phone": "975",
            "continent": "AS",
            "capital": "Thimphu",
            "currency": "BTN,INR",
            "languages": "dz"
        },
        "BV": {
            "name": "Bouvet Island",
            "native": "Bouvetøya",
            "phone": "",
            "continent": "AN",
            "capital": "",
            "currency": "NOK",
            "languages": ""
        },
        "BW": {
            "name": "Botswana",
            "native": "Botswana",
            "phone": "267",
            "continent": "AF",
            "capital": "Gaborone",
            "currency": "BWP",
            "languages": "en,tn"
        },
        "BY": {
            "name": "Belarus",
            "native": "Белару́сь",
            "phone": "375",
            "continent": "EU",
            "capital": "Minsk",
            "currency": "BYR",
            "languages": "be,ru"
        },
        "BZ": {
            "name": "Belize",
            "native": "Belize",
            "phone": "501",
            "continent": "NA",
            "capital": "Belmopan",
            "currency": "BZD",
            "languages": "en,es"
        },
        "CA": {
            "name": "Canada",
            "native": "Canada",
            "phone": "1",
            "continent": "NA",
            "capital": "Ottawa",
            "currency": "CAD",
            "languages": "en,fr"
        },
        "CC": {
            "name": "Cocos [Keeling] Islands",
            "native": "Cocos (Keeling) Islands",
            "phone": "61",
            "continent": "AS",
            "capital": "West Island",
            "currency": "AUD",
            "languages": "en"
        },
        "CD": {
            "name": "Democratic Republic of the Congo",
            "native": "République démocratique du Congo",
            "phone": "243",
            "continent": "AF",
            "capital": "Kinshasa",
            "currency": "CDF",
            "languages": "fr,ln,kg,sw,lu"
        },
        "CF": {
            "name": "Central African Republic",
            "native": "Ködörösêse tî Bêafrîka",
            "phone": "236",
            "continent": "AF",
            "capital": "Bangui",
            "currency": "XAF",
            "languages": "fr,sg"
        },
        "CG": {
            "name": "Republic of the Congo",
            "native": "République du Congo",
            "phone": "242",
            "continent": "AF",
            "capital": "Brazzaville",
            "currency": "XAF",
            "languages": "fr,ln"
        },
        "CH": {
            "name": "Switzerland",
            "native": "Schweiz",
            "phone": "41",
            "continent": "EU",
            "capital": "Bern",
            "currency": "CHE,CHF,CHW",
            "languages": "de,fr,it"
        },
        "CI": {
            "name": "Ivory Coast",
            "native": "Côte d'Ivoire",
            "phone": "225",
            "continent": "AF",
            "capital": "Yamoussoukro",
            "currency": "XOF",
            "languages": "fr"
        },
        "CK": {
            "name": "Cook Islands",
            "native": "Cook Islands",
            "phone": "682",
            "continent": "OC",
            "capital": "Avarua",
            "currency": "NZD",
            "languages": "en"
        },
        "CL": {
            "name": "Chile",
            "native": "Chile",
            "phone": "56",
            "continent": "SA",
            "capital": "Santiago",
            "currency": "CLF,CLP",
            "languages": "es"
        },
        "CM": {
            "name": "Cameroon",
            "native": "Cameroon",
            "phone": "237",
            "continent": "AF",
            "capital": "Yaoundé",
            "currency": "XAF",
            "languages": "en,fr"
        },
        "CN": {
            "name": "China",
            "native": "中国",
            "phone": "86",
            "continent": "AS",
            "capital": "Beijing",
            "currency": "CNY",
            "languages": "zh"
        },
        "CO": {
            "name": "Colombia",
            "native": "Colombia",
            "phone": "57",
            "continent": "SA",
            "capital": "Bogotá",
            "currency": "COP",
            "languages": "es"
        },
        "CR": {
            "name": "Costa Rica",
            "native": "Costa Rica",
            "phone": "506",
            "continent": "NA",
            "capital": "San José",
            "currency": "CRC",
            "languages": "es"
        },
        "CU": {
            "name": "Cuba",
            "native": "Cuba",
            "phone": "53",
            "continent": "NA",
            "capital": "Havana",
            "currency": "CUC,CUP",
            "languages": "es"
        },
        "CV": {
            "name": "Cape Verde",
            "native": "Cabo Verde",
            "phone": "238",
            "continent": "AF",
            "capital": "Praia",
            "currency": "CVE",
            "languages": "pt"
        },
        "CW": {
            "name": "Curacao",
            "native": "Curaçao",
            "phone": "5999",
            "continent": "NA",
            "capital": "Willemstad",
            "currency": "ANG",
            "languages": "nl,pa,en"
        },
        "CX": {
            "name": "Christmas Island",
            "native": "Christmas Island",
            "phone": "61",
            "continent": "AS",
            "capital": "Flying Fish Cove",
            "currency": "AUD",
            "languages": "en"
        },
        "CY": {
            "name": "Cyprus",
            "native": "Κύπρος",
            "phone": "357",
            "continent": "EU",
            "capital": "Nicosia",
            "currency": "EUR",
            "languages": "el,tr,hy"
        },
        "CZ": {
            "name": "Czechia",
            "native": "Česká republika",
            "phone": "420",
            "continent": "EU",
            "capital": "Prague",
            "currency": "CZK",
            "languages": "cs,sk"
        },
        "DE": {
            "name": "Germany",
            "native": "Deutschland",
            "phone": "49",
            "continent": "EU",
            "capital": "Berlin",
            "currency": "EUR",
            "languages": "de"
        },
        "DJ": {
            "name": "Djibouti",
            "native": "Djibouti",
            "phone": "253",
            "continent": "AF",
            "capital": "Djibouti",
            "currency": "DJF",
            "languages": "fr,ar"
        },
        "DK": {
            "name": "Denmark",
            "native": "Danmark",
            "phone": "45",
            "continent": "EU",
            "capital": "Copenhagen",
            "currency": "DKK",
            "languages": "da"
        },
        "DM": {
            "name": "Dominica",
            "native": "Dominica",
            "phone": "1767",
            "continent": "NA",
            "capital": "Roseau",
            "currency": "XCD",
            "languages": "en"
        },
        "DO": {
            "name": "Dominican Republic",
            "native": "República Dominicana",
            "phone": "1809,1829,1849",
            "continent": "NA",
            "capital": "Santo Domingo",
            "currency": "DOP",
            "languages": "es"
        },
        "DZ": {
            "name": "Algeria",
            "native": "الجزائر",
            "phone": "213",
            "continent": "AF",
            "capital": "Algiers",
            "currency": "DZD",
            "languages": "ar"
        },
        "EC": {
            "name": "Ecuador",
            "native": "Ecuador",
            "phone": "593",
            "continent": "SA",
            "capital": "Quito",
            "currency": "USD",
            "languages": "es"
        },
        "EE": {
            "name": "Estonia",
            "native": "Eesti",
            "phone": "372",
            "continent": "EU",
            "capital": "Tallinn",
            "currency": "EUR",
            "languages": "et"
        },
        "EG": {
            "name": "Egypt",
            "native": "مصر‎",
            "phone": "20",
            "continent": "AF",
            "capital": "Cairo",
            "currency": "EGP",
            "languages": "ar"
        },
        "EH": {
            "name": "Western Sahara",
            "native": "الصحراء الغربية",
            "phone": "212",
            "continent": "AF",
            "capital": "El Aaiún",
            "currency": "MAD,DZD,MRO",
            "languages": "es"
        },
        "ER": {
            "name": "Eritrea",
            "native": "ኤርትራ",
            "phone": "291",
            "continent": "AF",
            "capital": "Asmara",
            "currency": "ERN",
            "languages": "ti,ar,en"
        },
        "ES": {
            "name": "Spain",
            "native": "España",
            "phone": "34",
            "continent": "EU",
            "capital": "Madrid",
            "currency": "EUR",
            "languages": "es,eu,ca,gl,oc"
        },
        "ET": {
            "name": "Ethiopia",
            "native": "ኢትዮጵያ",
            "phone": "251",
            "continent": "AF",
            "capital": "Addis Ababa",
            "currency": "ETB",
            "languages": "am"
        },
        "FI": {
            "name": "Finland",
            "native": "Suomi",
            "phone": "358",
            "continent": "EU",
            "capital": "Helsinki",
            "currency": "EUR",
            "languages": "fi,sv"
        },
        "FJ": {
            "name": "Fiji",
            "native": "Fiji",
            "phone": "679",
            "continent": "OC",
            "capital": "Suva",
            "currency": "FJD",
            "languages": "en,fj,hi,ur"
        },
        "FK": {
            "name": "Falkland Islands",
            "native": "Falkland Islands",
            "phone": "500",
            "continent": "SA",
            "capital": "Stanley",
            "currency": "FKP",
            "languages": "en"
        },
        "FM": {
            "name": "Micronesia",
            "native": "Micronesia",
            "phone": "691",
            "continent": "OC",
            "capital": "Palikir",
            "currency": "USD",
            "languages": "en"
        },
        "FO": {
            "name": "Faroe Islands",
            "native": "Føroyar",
            "phone": "298",
            "continent": "EU",
            "capital": "Tórshavn",
            "currency": "DKK",
            "languages": "fo"
        },
        "FR": {
            "name": "France",
            "native": "France",
            "phone": "33",
            "continent": "EU",
            "capital": "Paris",
            "currency": "EUR",
            "languages": "fr"
        },
        "GA": {
            "name": "Gabon",
            "native": "Gabon",
            "phone": "241",
            "continent": "AF",
            "capital": "Libreville",
            "currency": "XAF",
            "languages": "fr"
        },
        "GB": {
            "name": "United Kingdom",
            "native": "United Kingdom",
            "phone": "44",
            "continent": "EU",
            "capital": "London",
            "currency": "GBP",
            "languages": "en"
        },
        "GD": {
            "name": "Grenada",
            "native": "Grenada",
            "phone": "1473",
            "continent": "NA",
            "capital": "St. George's",
            "currency": "XCD",
            "languages": "en"
        },
        "GE": {
            "name": "Georgia",
            "native": "საქართველო",
            "phone": "995",
            "continent": "AS",
            "capital": "Tbilisi",
            "currency": "GEL",
            "languages": "ka"
        },
        "GF": {
            "name": "French Guiana",
            "native": "Guyane française",
            "phone": "594",
            "continent": "SA",
            "capital": "Cayenne",
            "currency": "EUR",
            "languages": "fr"
        },
        "GG": {
            "name": "Guernsey",
            "native": "Guernsey",
            "phone": "44",
            "continent": "EU",
            "capital": "St. Peter Port",
            "currency": "GBP",
            "languages": "en,fr"
        },
        "GH": {
            "name": "Ghana",
            "native": "Ghana",
            "phone": "233",
            "continent": "AF",
            "capital": "Accra",
            "currency": "GHS",
            "languages": "en"
        },
        "GI": {
            "name": "Gibraltar",
            "native": "Gibraltar",
            "phone": "350",
            "continent": "EU",
            "capital": "Gibraltar",
            "currency": "GIP",
            "languages": "en"
        },
        "GL": {
            "name": "Greenland",
            "native": "Kalaallit Nunaat",
            "phone": "299",
            "continent": "NA",
            "capital": "Nuuk",
            "currency": "DKK",
            "languages": "kl"
        },
        "GM": {
            "name": "Gambia",
            "native": "Gambia",
            "phone": "220",
            "continent": "AF",
            "capital": "Banjul",
            "currency": "GMD",
            "languages": "en"
        },
        "GN": {
            "name": "Guinea",
            "native": "Guinée",
            "phone": "224",
            "continent": "AF",
            "capital": "Conakry",
            "currency": "GNF",
            "languages": "fr,ff"
        },
        "GP": {
            "name": "Guadeloupe",
            "native": "Guadeloupe",
            "phone": "590",
            "continent": "NA",
            "capital": "Basse-Terre",
            "currency": "EUR",
            "languages": "fr"
        },
        "GQ": {
            "name": "Equatorial Guinea",
            "native": "Guinea Ecuatorial",
            "phone": "240",
            "continent": "AF",
            "capital": "Malabo",
            "currency": "XAF",
            "languages": "es,fr"
        },
        "GR": {
            "name": "Greece",
            "native": "Ελλάδα",
            "phone": "30",
            "continent": "EU",
            "capital": "Athens",
            "currency": "EUR",
            "languages": "el"
        },
        "GS": {
            "name": "South Georgia and the South Sandwich Islands",
            "native": "South Georgia",
            "phone": "500",
            "continent": "AN",
            "capital": "King Edward Point",
            "currency": "GBP",
            "languages": "en"
        },
        "GT": {
            "name": "Guatemala",
            "native": "Guatemala",
            "phone": "502",
            "continent": "NA",
            "capital": "Guatemala City",
            "currency": "GTQ",
            "languages": "es"
        },
        "GU": {
            "name": "Guam",
            "native": "Guam",
            "phone": "1671",
            "continent": "OC",
            "capital": "Hagåtña",
            "currency": "USD",
            "languages": "en,ch,es"
        },
        "GW": {
            "name": "Guinea-Bissau",
            "native": "Guiné-Bissau",
            "phone": "245",
            "continent": "AF",
            "capital": "Bissau",
            "currency": "XOF",
            "languages": "pt"
        },
        "GY": {
            "name": "Guyana",
            "native": "Guyana",
            "phone": "592",
            "continent": "SA",
            "capital": "Georgetown",
            "currency": "GYD",
            "languages": "en"
        },
        "HK": {
            "name": "Hong Kong",
            "native": "香港",
            "phone": "852",
            "continent": "AS",
            "capital": "City of Victoria",
            "currency": "HKD",
            "languages": "zh,en"
        },
        "HM": {
            "name": "Heard Island and McDonald Islands",
            "native": "Heard Island and McDonald Islands",
            "phone": "",
            "continent": "AN",
            "capital": "",
            "currency": "AUD",
            "languages": "en"
        },
        "HN": {
            "name": "Honduras",
            "native": "Honduras",
            "phone": "504",
            "continent": "NA",
            "capital": "Tegucigalpa",
            "currency": "HNL",
            "languages": "es"
        },
        "HR": {
            "name": "Croatia",
            "native": "Hrvatska",
            "phone": "385",
            "continent": "EU",
            "capital": "Zagreb",
            "currency": "HRK",
            "languages": "hr"
        },
        "HT": {
            "name": "Haiti",
            "native": "Haïti",
            "phone": "509",
            "continent": "NA",
            "capital": "Port-au-Prince",
            "currency": "HTG,USD",
            "languages": "fr,ht"
        },
        "HU": {
            "name": "Hungary",
            "native": "Magyarország",
            "phone": "36",
            "continent": "EU",
            "capital": "Budapest",
            "currency": "HUF",
            "languages": "hu"
        },
        "ID": {
            "name": "Indonesia",
            "native": "Indonesia",
            "phone": "62",
            "continent": "AS",
            "capital": "Jakarta",
            "currency": "IDR",
            "languages": "id"
        },
        "IE": {
            "name": "Ireland",
            "native": "Éire",
            "phone": "353",
            "continent": "EU",
            "capital": "Dublin",
            "currency": "EUR",
            "languages": "ga,en"
        },
        "IL": {
            "name": "Israel",
            "native": "יִשְׂרָאֵל",
            "phone": "972",
            "continent": "AS",
            "capital": "Jerusalem",
            "currency": "ILS",
            "languages": "he,ar"
        },
        "IM": {
            "name": "Isle of Man",
            "native": "Isle of Man",
            "phone": "44",
            "continent": "EU",
            "capital": "Douglas",
            "currency": "GBP",
            "languages": "en,gv"
        },
        "IN": {
            "name": "India",
            "native": "भारत",
            "phone": "91",
            "continent": "AS",
            "capital": "New Delhi",
            "currency": "INR",
            "languages": "hi,en"
        },
        "IO": {
            "name": "British Indian Ocean Territory",
            "native": "British Indian Ocean Territory",
            "phone": "246",
            "continent": "AS",
            "capital": "Diego Garcia",
            "currency": "USD",
            "languages": "en"
        },
        "IQ": {
            "name": "Iraq",
            "native": "العراق",
            "phone": "964",
            "continent": "AS",
            "capital": "Baghdad",
            "currency": "IQD",
            "languages": "ar,ku"
        },
        "IR": {
            "name": "Iran",
            "native": "Irān",
            "phone": "98",
            "continent": "AS",
            "capital": "Tehran",
            "currency": "IRR",
            "languages": "fa"
        },
        "IS": {
            "name": "Iceland",
            "native": "Ísland",
            "phone": "354",
            "continent": "EU",
            "capital": "Reykjavik",
            "currency": "ISK",
            "languages": "is"
        },
        "IT": {
            "name": "Italy",
            "native": "Italia",
            "phone": "39",
            "continent": "EU",
            "capital": "Rome",
            "currency": "EUR",
            "languages": "it"
        },
        "JE": {
            "name": "Jersey",
            "native": "Jersey",
            "phone": "44",
            "continent": "EU",
            "capital": "Saint Helier",
            "currency": "GBP",
            "languages": "en,fr"
        },
        "JM": {
            "name": "Jamaica",
            "native": "Jamaica",
            "phone": "1876",
            "continent": "NA",
            "capital": "Kingston",
            "currency": "JMD",
            "languages": "en"
        },
        "JO": {
            "name": "Jordan",
            "native": "الأردن",
            "phone": "962",
            "continent": "AS",
            "capital": "Amman",
            "currency": "JOD",
            "languages": "ar"
        },
        "JP": {
            "name": "Japan",
            "native": "日本",
            "phone": "81",
            "continent": "AS",
            "capital": "Tokyo",
            "currency": "JPY",
            "languages": "ja"
        },
        "KE": {
            "name": "Kenya",
            "native": "Kenya",
            "phone": "254",
            "continent": "AF",
            "capital": "Nairobi",
            "currency": "KES",
            "languages": "en,sw"
        },
        "KG": {
            "name": "Kyrgyzstan",
            "native": "Кыргызстан",
            "phone": "996",
            "continent": "AS",
            "capital": "Bishkek",
            "currency": "KGS",
            "languages": "ky,ru"
        },
        "KH": {
            "name": "Cambodia",
            "native": "Kâmpŭchéa",
            "phone": "855",
            "continent": "AS",
            "capital": "Phnom Penh",
            "currency": "KHR",
            "languages": "km"
        },
        "KI": {
            "name": "Kiribati",
            "native": "Kiribati",
            "phone": "686",
            "continent": "OC",
            "capital": "South Tarawa",
            "currency": "AUD",
            "languages": "en"
        },
        "KM": {
            "name": "Comoros",
            "native": "Komori",
            "phone": "269",
            "continent": "AF",
            "capital": "Moroni",
            "currency": "KMF",
            "languages": "ar,fr"
        },
        "KN": {
            "name": "Saint Kitts and Nevis",
            "native": "Saint Kitts and Nevis",
            "phone": "1869",
            "continent": "NA",
            "capital": "Basseterre",
            "currency": "XCD",
            "languages": "en"
        },
        "KP": {
            "name": "North Korea",
            "native": "북한",
            "phone": "850",
            "continent": "AS",
            "capital": "Pyongyang",
            "currency": "KPW",
            "languages": "ko"
        },
        "KR": {
            "name": "South Korea",
            "native": "대한민국",
            "phone": "82",
            "continent": "AS",
            "capital": "Seoul",
            "currency": "KRW",
            "languages": "ko"
        },
        "KW": {
            "name": "Kuwait",
            "native": "الكويت",
            "phone": "965",
            "continent": "AS",
            "capital": "Kuwait City",
            "currency": "KWD",
            "languages": "ar"
        },
        "KY": {
            "name": "Cayman Islands",
            "native": "Cayman Islands",
            "phone": "1345",
            "continent": "NA",
            "capital": "George Town",
            "currency": "KYD",
            "languages": "en"
        },
        "KZ": {
            "name": "Kazakhstan",
            "native": "Қазақстан",
            "phone": "76,77",
            "continent": "AS",
            "capital": "Astana",
            "currency": "KZT",
            "languages": "kk,ru"
        },
        "LA": {
            "name": "Laos",
            "native": "ສປປລາວ",
            "phone": "856",
            "continent": "AS",
            "capital": "Vientiane",
            "currency": "LAK",
            "languages": "lo"
        },
        "LB": {
            "name": "Lebanon",
            "native": "لبنان",
            "phone": "961",
            "continent": "AS",
            "capital": "Beirut",
            "currency": "LBP",
            "languages": "ar,fr"
        },
        "LC": {
            "name": "Saint Lucia",
            "native": "Saint Lucia",
            "phone": "1758",
            "continent": "NA",
            "capital": "Castries",
            "currency": "XCD",
            "languages": "en"
        },
        "LI": {
            "name": "Liechtenstein",
            "native": "Liechtenstein",
            "phone": "423",
            "continent": "EU",
            "capital": "Vaduz",
            "currency": "CHF",
            "languages": "de"
        },
        "LK": {
            "name": "Sri Lanka",
            "native": "śrī laṃkāva",
            "phone": "94",
            "continent": "AS",
            "capital": "Colombo",
            "currency": "LKR",
            "languages": "si,ta"
        },
        "LR": {
            "name": "Liberia",
            "native": "Liberia",
            "phone": "231",
            "continent": "AF",
            "capital": "Monrovia",
            "currency": "LRD",
            "languages": "en"
        },
        "LS": {
            "name": "Lesotho",
            "native": "Lesotho",
            "phone": "266",
            "continent": "AF",
            "capital": "Maseru",
            "currency": "LSL,ZAR",
            "languages": "en,st"
        },
        "LT": {
            "name": "Lithuania",
            "native": "Lietuva",
            "phone": "370",
            "continent": "EU",
            "capital": "Vilnius",
            "currency": "LTL",
            "languages": "lt"
        },
        "LU": {
            "name": "Luxembourg",
            "native": "Luxembourg",
            "phone": "352",
            "continent": "EU",
            "capital": "Luxembourg",
            "currency": "EUR",
            "languages": "fr,de,lb"
        },
        "LV": {
            "name": "Latvia",
            "native": "Latvija",
            "phone": "371",
            "continent": "EU",
            "capital": "Riga",
            "currency": "EUR",
            "languages": "lv"
        },
        "LY": {
            "name": "Libya",
            "native": "‏ليبيا",
            "phone": "218",
            "continent": "AF",
            "capital": "Tripoli",
            "currency": "LYD",
            "languages": "ar"
        },
        "MA": {
            "name": "Morocco",
            "native": "المغرب",
            "phone": "212",
            "continent": "AF",
            "capital": "Rabat",
            "currency": "MAD",
            "languages": "ar"
        },
        "MC": {
            "name": "Monaco",
            "native": "Monaco",
            "phone": "377",
            "continent": "EU",
            "capital": "Monaco",
            "currency": "EUR",
            "languages": "fr"
        },
        "MD": {
            "name": "Moldova",
            "native": "Moldova",
            "phone": "373",
            "continent": "EU",
            "capital": "Chișinău",
            "currency": "MDL",
            "languages": "ro"
        },
        "ME": {
            "name": "Montenegro",
            "native": "Црна Гора",
            "phone": "382",
            "continent": "EU",
            "capital": "Podgorica",
            "currency": "EUR",
            "languages": "sr,bs,sq,hr"
        },
        "MF": {
            "name": "Saint Martin",
            "native": "Saint-Martin",
            "phone": "590",
            "continent": "NA",
            "capital": "Marigot",
            "currency": "EUR",
            "languages": "en,fr,nl"
        },
        "MG": {
            "name": "Madagascar",
            "native": "Madagasikara",
            "phone": "261",
            "continent": "AF",
            "capital": "Antananarivo",
            "currency": "MGA",
            "languages": "fr,mg"
        },
        "MH": {
            "name": "Marshall Islands",
            "native": "M̧ajeļ",
            "phone": "692",
            "continent": "OC",
            "capital": "Majuro",
            "currency": "USD",
            "languages": "en,mh"
        },
        "MK": {
            "name": "Macedonia",
            "native": "Македонија",
            "phone": "389",
            "continent": "EU",
            "capital": "Skopje",
            "currency": "MKD",
            "languages": "mk"
        },
        "ML": {
            "name": "Mali",
            "native": "Mali",
            "phone": "223",
            "continent": "AF",
            "capital": "Bamako",
            "currency": "XOF",
            "languages": "fr"
        },
        "MM": {
            "name": "Myanmar [Burma]",
            "native": "Myanma",
            "phone": "95",
            "continent": "AS",
            "capital": "Naypyidaw",
            "currency": "MMK",
            "languages": "my"
        },
        "MN": {
            "name": "Mongolia",
            "native": "Монгол улс",
            "phone": "976",
            "continent": "AS",
            "capital": "Ulan Bator",
            "currency": "MNT",
            "languages": "mn"
        },
        "MO": {
            "name": "Macao",
            "native": "澳門",
            "phone": "853",
            "continent": "AS",
            "capital": "",
            "currency": "MOP",
            "languages": "zh,pt"
        },
        "MP": {
            "name": "Northern Mariana Islands",
            "native": "Northern Mariana Islands",
            "phone": "1670",
            "continent": "OC",
            "capital": "Saipan",
            "currency": "USD",
            "languages": "en,ch"
        },
        "MQ": {
            "name": "Martinique",
            "native": "Martinique",
            "phone": "596",
            "continent": "NA",
            "capital": "Fort-de-France",
            "currency": "EUR",
            "languages": "fr"
        },
        "MR": {
            "name": "Mauritania",
            "native": "موريتانيا",
            "phone": "222",
            "continent": "AF",
            "capital": "Nouakchott",
            "currency": "MRO",
            "languages": "ar"
        },
        "MS": {
            "name": "Montserrat",
            "native": "Montserrat",
            "phone": "1664",
            "continent": "NA",
            "capital": "Plymouth",
            "currency": "XCD",
            "languages": "en"
        },
        "MT": {
            "name": "Malta",
            "native": "Malta",
            "phone": "356",
            "continent": "EU",
            "capital": "Valletta",
            "currency": "EUR",
            "languages": "mt,en"
        },
        "MU": {
            "name": "Mauritius",
            "native": "Maurice",
            "phone": "230",
            "continent": "AF",
            "capital": "Port Louis",
            "currency": "MUR",
            "languages": "en"
        },
        "MV": {
            "name": "Maldives",
            "native": "Maldives",
            "phone": "960",
            "continent": "AS",
            "capital": "Malé",
            "currency": "MVR",
            "languages": "dv"
        },
        "MW": {
            "name": "Malawi",
            "native": "Malawi",
            "phone": "265",
            "continent": "AF",
            "capital": "Lilongwe",
            "currency": "MWK",
            "languages": "en,ny"
        },
        "MX": {
            "name": "Mexico",
            "native": "México",
            "phone": "52",
            "continent": "NA",
            "capital": "Mexico City",
            "currency": "MXN",
            "languages": "es"
        },
        "MY": {
            "name": "Malaysia",
            "native": "Malaysia",
            "phone": "60",
            "continent": "AS",
            "capital": "Kuala Lumpur",
            "currency": "MYR",
            "languages": ""
        },
        "MZ": {
            "name": "Mozambique",
            "native": "Moçambique",
            "phone": "258",
            "continent": "AF",
            "capital": "Maputo",
            "currency": "MZN",
            "languages": "pt"
        },
        "NA": {
            "name": "Namibia",
            "native": "Namibia",
            "phone": "264",
            "continent": "AF",
            "capital": "Windhoek",
            "currency": "NAD,ZAR",
            "languages": "en,af"
        },
        "NC": {
            "name": "New Caledonia",
            "native": "Nouvelle-Calédonie",
            "phone": "687",
            "continent": "OC",
            "capital": "Nouméa",
            "currency": "XPF",
            "languages": "fr"
        },
        "NE": {
            "name": "Niger",
            "native": "Niger",
            "phone": "227",
            "continent": "AF",
            "capital": "Niamey",
            "currency": "XOF",
            "languages": "fr"
        },
        "NF": {
            "name": "Norfolk Island",
            "native": "Norfolk Island",
            "phone": "672",
            "continent": "OC",
            "capital": "Kingston",
            "currency": "AUD",
            "languages": "en"
        },
        "NG": {
            "name": "Nigeria",
            "native": "Nigeria",
            "phone": "234",
            "continent": "AF",
            "capital": "Abuja",
            "currency": "NGN",
            "languages": "en"
        },
        "NI": {
            "name": "Nicaragua",
            "native": "Nicaragua",
            "phone": "505",
            "continent": "NA",
            "capital": "Managua",
            "currency": "NIO",
            "languages": "es"
        },
        "NL": {
            "name": "Netherlands",
            "native": "Nederland",
            "phone": "31",
            "continent": "EU",
            "capital": "Amsterdam",
            "currency": "EUR",
            "languages": "nl"
        },
        "NO": {
            "name": "Norway",
            "native": "Norge",
            "phone": "47",
            "continent": "EU",
            "capital": "Oslo",
            "currency": "NOK",
            "languages": "no,nb,nn"
        },
        "NP": {
            "name": "Nepal",
            "native": "नपल",
            "phone": "977",
            "continent": "AS",
            "capital": "Kathmandu",
            "currency": "NPR",
            "languages": "ne"
        },
        "NR": {
            "name": "Nauru",
            "native": "Nauru",
            "phone": "674",
            "continent": "OC",
            "capital": "Yaren",
            "currency": "AUD",
            "languages": "en,na"
        },
        "NU": {
            "name": "Niue",
            "native": "Niuē",
            "phone": "683",
            "continent": "OC",
            "capital": "Alofi",
            "currency": "NZD",
            "languages": "en"
        },
        "NZ": {
            "name": "New Zealand",
            "native": "New Zealand",
            "phone": "64",
            "continent": "OC",
            "capital": "Wellington",
            "currency": "NZD",
            "languages": "en,mi"
        },
        "OM": {
            "name": "Oman",
            "native": "عمان",
            "phone": "968",
            "continent": "AS",
            "capital": "Muscat",
            "currency": "OMR",
            "languages": "ar"
        },
        "PA": {
            "name": "Panama",
            "native": "Panamá",
            "phone": "507",
            "continent": "NA",
            "capital": "Panama City",
            "currency": "PAB,USD",
            "languages": "es"
        },
        "PE": {
            "name": "Peru",
            "native": "Perú",
            "phone": "51",
            "continent": "SA",
            "capital": "Lima",
            "currency": "PEN",
            "languages": "es"
        },
        "PF": {
            "name": "French Polynesia",
            "native": "Polynésie française",
            "phone": "689",
            "continent": "OC",
            "capital": "Papeetē",
            "currency": "XPF",
            "languages": "fr"
        },
        "PG": {
            "name": "Papua New Guinea",
            "native": "Papua Niugini",
            "phone": "675",
            "continent": "OC",
            "capital": "Port Moresby",
            "currency": "PGK",
            "languages": "en"
        },
        "PH": {
            "name": "Philippines",
            "native": "Pilipinas",
            "phone": "63",
            "continent": "AS",
            "capital": "Manila",
            "currency": "PHP",
            "languages": "en"
        },
        "PK": {
            "name": "Pakistan",
            "native": "Pakistan",
            "phone": "92",
            "continent": "AS",
            "capital": "Islamabad",
            "currency": "PKR",
            "languages": "en,ur"
        },
        "PL": {
            "name": "Poland",
            "native": "Polska",
            "phone": "48",
            "continent": "EU",
            "capital": "Warsaw",
            "currency": "PLN",
            "languages": "pl"
        },
        "PM": {
            "name": "Saint Pierre and Miquelon",
            "native": "Saint-Pierre-et-Miquelon",
            "phone": "508",
            "continent": "NA",
            "capital": "Saint-Pierre",
            "currency": "EUR",
            "languages": "fr"
        },
        "PN": {
            "name": "Pitcairn Islands",
            "native": "Pitcairn Islands",
            "phone": "64",
            "continent": "OC",
            "capital": "Adamstown",
            "currency": "NZD",
            "languages": "en"
        },
        "PR": {
            "name": "Puerto Rico",
            "native": "Puerto Rico",
            "phone": "1787,1939",
            "continent": "NA",
            "capital": "San Juan",
            "currency": "USD",
            "languages": "es,en"
        },
        "PS": {
            "name": "Palestine",
            "native": "فلسطين",
            "phone": "970",
            "continent": "AS",
            "capital": "Ramallah",
            "currency": "ILS",
            "languages": "ar"
        },
        "PT": {
            "name": "Portugal",
            "native": "Portugal",
            "phone": "351",
            "continent": "EU",
            "capital": "Lisbon",
            "currency": "EUR",
            "languages": "pt"
        },
        "PW": {
            "name": "Palau",
            "native": "Palau",
            "phone": "680",
            "continent": "OC",
            "capital": "Ngerulmud",
            "currency": "USD",
            "languages": "en"
        },
        "PY": {
            "name": "Paraguay",
            "native": "Paraguay",
            "phone": "595",
            "continent": "SA",
            "capital": "Asunción",
            "currency": "PYG",
            "languages": "es,gn"
        },
        "QA": {
            "name": "Qatar",
            "native": "قطر",
            "phone": "974",
            "continent": "AS",
            "capital": "Doha",
            "currency": "QAR",
            "languages": "ar"
        },
        "RE": {
            "name": "Réunion",
            "native": "La Réunion",
            "phone": "262",
            "continent": "AF",
            "capital": "Saint-Denis",
            "currency": "EUR",
            "languages": "fr"
        },
        "RO": {
            "name": "Romania",
            "native": "România",
            "phone": "40",
            "continent": "EU",
            "capital": "Bucharest",
            "currency": "RON",
            "languages": "ro"
        },
        "RS": {
            "name": "Serbia",
            "native": "Србија",
            "phone": "381",
            "continent": "EU",
            "capital": "Belgrade",
            "currency": "RSD",
            "languages": "sr"
        },
        "RU": {
            "name": "Russia",
            "native": "Россия",
            "phone": "7",
            "continent": "EU",
            "capital": "Moscow",
            "currency": "RUB",
            "languages": "ru"
        },
        "RW": {
            "name": "Rwanda",
            "native": "Rwanda",
            "phone": "250",
            "continent": "AF",
            "capital": "Kigali",
            "currency": "RWF",
            "languages": "rw,en,fr"
        },
        "SA": {
            "name": "Saudi Arabia",
            "native": "العربية السعودية",
            "phone": "966",
            "continent": "AS",
            "capital": "Riyadh",
            "currency": "SAR",
            "languages": "ar"
        },
        "SB": {
            "name": "Solomon Islands",
            "native": "Solomon Islands",
            "phone": "677",
            "continent": "OC",
            "capital": "Honiara",
            "currency": "SDB",
            "languages": "en"
        },
        "SC": {
            "name": "Seychelles",
            "native": "Seychelles",
            "phone": "248",
            "continent": "AF",
            "capital": "Victoria",
            "currency": "SCR",
            "languages": "fr,en"
        },
        "SD": {
            "name": "Sudan",
            "native": "السودان",
            "phone": "249",
            "continent": "AF",
            "capital": "Khartoum",
            "currency": "SDG",
            "languages": "ar,en"
        },
        "SE": {
            "name": "Sweden",
            "native": "Sverige",
            "phone": "46",
            "continent": "EU",
            "capital": "Stockholm",
            "currency": "SEK",
            "languages": "sv"
        },
        "SG": {
            "name": "Singapore",
            "native": "Singapore",
            "phone": "65",
            "continent": "AS",
            "capital": "Singapore",
            "currency": "SGD",
            "languages": "en,ms,ta,zh"
        },
        "SH": {
            "name": "Saint Helena",
            "native": "Saint Helena",
            "phone": "290",
            "continent": "AF",
            "capital": "Jamestown",
            "currency": "SHP",
            "languages": "en"
        },
        "SI": {
            "name": "Slovenia",
            "native": "Slovenija",
            "phone": "386",
            "continent": "EU",
            "capital": "Ljubljana",
            "currency": "EUR",
            "languages": "sl"
        },
        "SJ": {
            "name": "Svalbard and Jan Mayen",
            "native": "Svalbard og Jan Mayen",
            "phone": "4779",
            "continent": "EU",
            "capital": "Longyearbyen",
            "currency": "NOK",
            "languages": "no"
        },
        "SK": {
            "name": "Slovakia",
            "native": "Slovensko",
            "phone": "421",
            "continent": "EU",
            "capital": "Bratislava",
            "currency": "EUR",
            "languages": "sk"
        },
        "SL": {
            "name": "Sierra Leone",
            "native": "Sierra Leone",
            "phone": "232",
            "continent": "AF",
            "capital": "Freetown",
            "currency": "SLL",
            "languages": "en"
        },
        "SM": {
            "name": "San Marino",
            "native": "San Marino",
            "phone": "378",
            "continent": "EU",
            "capital": "City of San Marino",
            "currency": "EUR",
            "languages": "it"
        },
        "SN": {
            "name": "Senegal",
            "native": "Sénégal",
            "phone": "221",
            "continent": "AF",
            "capital": "Dakar",
            "currency": "XOF",
            "languages": "fr"
        },
        "SO": {
            "name": "Somalia",
            "native": "Soomaaliya",
            "phone": "252",
            "continent": "AF",
            "capital": "Mogadishu",
            "currency": "SOS",
            "languages": "so,ar"
        },
        "SR": {
            "name": "Suriname",
            "native": "Suriname",
            "phone": "597",
            "continent": "SA",
            "capital": "Paramaribo",
            "currency": "SRD",
            "languages": "nl"
        },
        "SS": {
            "name": "South Sudan",
            "native": "South Sudan",
            "phone": "211",
            "continent": "AF",
            "capital": "Juba",
            "currency": "SSP",
            "languages": "en"
        },
        "ST": {
            "name": "São Tomé and Príncipe",
            "native": "São Tomé e Príncipe",
            "phone": "239",
            "continent": "AF",
            "capital": "São Tomé",
            "currency": "STD",
            "languages": "pt"
        },
        "SV": {
            "name": "El Salvador",
            "native": "El Salvador",
            "phone": "503",
            "continent": "NA",
            "capital": "San Salvador",
            "currency": "SVC,USD",
            "languages": "es"
        },
        "SX": {
            "name": "Sint Maarten",
            "native": "Sint Maarten",
            "phone": "1721",
            "continent": "NA",
            "capital": "Philipsburg",
            "currency": "ANG",
            "languages": "nl,en"
        },
        "SY": {
            "name": "Syria",
            "native": "سوريا",
            "phone": "963",
            "continent": "AS",
            "capital": "Damascus",
            "currency": "SYP",
            "languages": "ar"
        },
        "SZ": {
            "name": "Swaziland",
            "native": "Swaziland",
            "phone": "268",
            "continent": "AF",
            "capital": "Lobamba",
            "currency": "SZL",
            "languages": "en,ss"
        },
        "TC": {
            "name": "Turks and Caicos Islands",
            "native": "Turks and Caicos Islands",
            "phone": "1649",
            "continent": "NA",
            "capital": "Cockburn Town",
            "currency": "USD",
            "languages": "en"
        },
        "TD": {
            "name": "Chad",
            "native": "Tchad",
            "phone": "235",
            "continent": "AF",
            "capital": "N'Djamena",
            "currency": "XAF",
            "languages": "fr,ar"
        },
        "TF": {
            "name": "French Southern Territories",
            "native": "Territoire des Terres australes et antarctiques fr",
            "phone": "",
            "continent": "AN",
            "capital": "Port-aux-Français",
            "currency": "EUR",
            "languages": "fr"
        },
        "TG": {
            "name": "Togo",
            "native": "Togo",
            "phone": "228",
            "continent": "AF",
            "capital": "Lomé",
            "currency": "XOF",
            "languages": "fr"
        },
        "TH": {
            "name": "Thailand",
            "native": "ประเทศไทย",
            "phone": "66",
            "continent": "AS",
            "capital": "Bangkok",
            "currency": "THB",
            "languages": "th"
        },
        "TJ": {
            "name": "Tajikistan",
            "native": "Тоҷикистон",
            "phone": "992",
            "continent": "AS",
            "capital": "Dushanbe",
            "currency": "TJS",
            "languages": "tg,ru"
        },
        "TK": {
            "name": "Tokelau",
            "native": "Tokelau",
            "phone": "690",
            "continent": "OC",
            "capital": "Fakaofo",
            "currency": "NZD",
            "languages": "en"
        },
        "TL": {
            "name": "East Timor",
            "native": "Timor-Leste",
            "phone": "670",
            "continent": "OC",
            "capital": "Dili",
            "currency": "USD",
            "languages": "pt"
        },
        "TM": {
            "name": "Turkmenistan",
            "native": "Türkmenistan",
            "phone": "993",
            "continent": "AS",
            "capital": "Ashgabat",
            "currency": "TMT",
            "languages": "tk,ru"
        },
        "TN": {
            "name": "Tunisia",
            "native": "تونس",
            "phone": "216",
            "continent": "AF",
            "capital": "Tunis",
            "currency": "TND",
            "languages": "ar"
        },
        "TO": {
            "name": "Tonga",
            "native": "Tonga",
            "phone": "676",
            "continent": "OC",
            "capital": "Nuku'alofa",
            "currency": "TOP",
            "languages": "en,to"
        },
        "TR": {
            "name": "Turkey",
            "native": "Türkiye",
            "phone": "90",
            "continent": "AS",
            "capital": "Ankara",
            "currency": "TRY",
            "languages": "tr"
        },
        "TT": {
            "name": "Trinidad and Tobago",
            "native": "Trinidad and Tobago",
            "phone": "1868",
            "continent": "NA",
            "capital": "Port of Spain",
            "currency": "TTD",
            "languages": "en"
        },
        "TV": {
            "name": "Tuvalu",
            "native": "Tuvalu",
            "phone": "688",
            "continent": "OC",
            "capital": "Funafuti",
            "currency": "AUD",
            "languages": "en"
        },
        "TW": {
            "name": "Taiwan",
            "native": "臺灣",
            "phone": "886",
            "continent": "AS",
            "capital": "Taipei",
            "currency": "TWD",
            "languages": "zh"
        },
        "TZ": {
            "name": "Tanzania",
            "native": "Tanzania",
            "phone": "255",
            "continent": "AF",
            "capital": "Dodoma",
            "currency": "TZS",
            "languages": "sw,en"
        },
        "UA": {
            "name": "Ukraine",
            "native": "Україна",
            "phone": "380",
            "continent": "EU",
            "capital": "Kiev",
            "currency": "UAH",
            "languages": "uk"
        },
        "UG": {
            "name": "Uganda",
            "native": "Uganda",
            "phone": "256",
            "continent": "AF",
            "capital": "Kampala",
            "currency": "UGX",
            "languages": "en,sw"
        },
        "UM": {
            "name": "U.S. Minor Outlying Islands",
            "native": "United States Minor Outlying Islands",
            "phone": "",
            "continent": "OC",
            "capital": "",
            "currency": "USD",
            "languages": "en"
        },
        "US": {
            "name": "United States",
            "native": "United States",
            "phone": "1",
            "continent": "NA",
            "capital": "Washington D.C.",
            "currency": "USD,USN,USS",
            "languages": "en"
        },
        "UY": {
            "name": "Uruguay",
            "native": "Uruguay",
            "phone": "598",
            "continent": "SA",
            "capital": "Montevideo",
            "currency": "UYI,UYU",
            "languages": "es"
        },
        "UZ": {
            "name": "Uzbekistan",
            "native": "O‘zbekiston",
            "phone": "998",
            "continent": "AS",
            "capital": "Tashkent",
            "currency": "UZS",
            "languages": "uz,ru"
        },
        "VA": {
            "name": "Vatican City",
            "native": "Vaticano",
            "phone": "39066,379",
            "continent": "EU",
            "capital": "Vatican City",
            "currency": "EUR",
            "languages": "it,la"
        },
        "VC": {
            "name": "Saint Vincent and the Grenadines",
            "native": "Saint Vincent and the Grenadines",
            "phone": "1784",
            "continent": "NA",
            "capital": "Kingstown",
            "currency": "XCD",
            "languages": "en"
        },
        "VE": {
            "name": "Venezuela",
            "native": "Venezuela",
            "phone": "58",
            "continent": "SA",
            "capital": "Caracas",
            "currency": "VEF",
            "languages": "es"
        },
        "VG": {
            "name": "British Virgin Islands",
            "native": "British Virgin Islands",
            "phone": "1284",
            "continent": "NA",
            "capital": "Road Town",
            "currency": "USD",
            "languages": "en"
        },
        "VI": {
            "name": "U.S. Virgin Islands",
            "native": "United States Virgin Islands",
            "phone": "1340",
            "continent": "NA",
            "capital": "Charlotte Amalie",
            "currency": "USD",
            "languages": "en"
        },
        "VN": {
            "name": "Vietnam",
            "native": "Việt Nam",
            "phone": "84",
            "continent": "AS",
            "capital": "Hanoi",
            "currency": "VND",
            "languages": "vi"
        },
        "VU": {
            "name": "Vanuatu",
            "native": "Vanuatu",
            "phone": "678",
            "continent": "OC",
            "capital": "Port Vila",
            "currency": "VUV",
            "languages": "bi,en,fr"
        },
        "WF": {
            "name": "Wallis and Futuna",
            "native": "Wallis et Futuna",
            "phone": "681",
            "continent": "OC",
            "capital": "Mata-Utu",
            "currency": "XPF",
            "languages": "fr"
        },
        "WS": {
            "name": "Samoa",
            "native": "Samoa",
            "phone": "685",
            "continent": "OC",
            "capital": "Apia",
            "currency": "WST",
            "languages": "sm,en"
        },
        "XK": {
            "name": "Kosovo",
            "native": "Republika e Kosovës",
            "phone": "377,381,386",
            "continent": "EU",
            "capital": "Pristina",
            "currency": "EUR",
            "languages": "sq,sr"
        },
        "YE": {
            "name": "Yemen",
            "native": "اليَمَن",
            "phone": "967",
            "continent": "AS",
            "capital": "Sana'a",
            "currency": "YER",
            "languages": "ar"
        },
        "YT": {
            "name": "Mayotte",
            "native": "Mayotte",
            "phone": "262",
            "continent": "AF",
            "capital": "Mamoudzou",
            "currency": "EUR",
            "languages": "fr"
        },
        "ZA": {
            "name": "South Africa",
            "native": "South Africa",
            "phone": "27",
            "continent": "AF",
            "capital": "Pretoria",
            "currency": "ZAR",
            "languages": "af,en,nr,st,ss,tn,ts,ve,xh,zu"
        },
        "ZM": {
            "name": "Zambia",
            "native": "Zambia",
            "phone": "260",
            "continent": "AF",
            "capital": "Lusaka",
            "currency": "ZMK",
            "languages": "en"
        },
        "ZW": {
            "name": "Zimbabwe",
            "native": "Zimbabwe",
            "phone": "263",
            "continent": "AF",
            "capital": "Harare",
            "currency": "ZWL",
            "languages": "en,sn,nd"
        }
    };

    var results = [];
    _.each(countries,function(value,key){
        results.push({code : key, name : value.name, phone : value.phone, languages : value.languages.split(',')});
    })
    return results;
}

function getLanguages(){
    return  [
        {"code" : "ab","englishName" : "Abkhaz","name" : "аҧсуа"},
        {"code" : "aa","englishName" : "Afar","name" : "Afaraf"},
        {"code" : "af","englishName" : "Afrikaans","name" : "Afrikaans"},
        {"code" : "ak","englishName" : "Akan","name" : "Akan"},
        {"code" : "sq","englishName" : "Albanian","name" : "Shqip"},
        {"code" : "am","englishName" : "Amharic","name" : "አማርኛ"},
        {"code" : "ar","englishName" : "Arabic","name" : "العربية"},
        {"code" : "an","englishName" : "Aragonese","name" : "Aragonés"},
        {"code" : "hy","englishName" : "Armenian","name" : "Հայերեն"},
        {"code" : "as","englishName" : "Assamese","name" : "অসমীয়া"},
        {"code" : "av","englishName" : "Avaric","name" : "авар мацӀ, магӀарул мацӀ"},
        {"code" : "ae","englishName" : "Avestan","name" : "avesta"},
        {"code" : "ay","englishName" : "Aymara","name" : "aymar aru"},
        {"code" : "az","englishName" : "Azerbaijani","name" : "azərbaycan dili"},
        {"code" : "bm","englishName" : "Bambara","name" : "bamanankan"},
        {"code" : "ba","englishName" : "Bashkir","name" : "башҡорт теле"},
        {"code" : "eu","englishName" : "Basque","name" : "euskara, euskera"},
        {"code" : "be","englishName" : "Belarusian","name" : "Беларуская"},
        {"code" : "bn","englishName" : "Bengali","name" : "বাংলা"},
        {"code" : "bh","englishName" : "Bihari","name" : "भोजपुरी"},
        {"code" : "bi","englishName" : "Bislama","name" : "Bislama"},
        {"code" : "bs","englishName" : "Bosnian","name" : "bosanski jezik"},
        {"code" : "br","englishName" : "Breton","name" : "brezhoneg"},
        {"code" : "bg","englishName" : "Bulgarian","name" : "български език"},
        {"code" : "my","englishName" : "Burmese","name" : "ဗမာစာ"},
        {"code" : "ca","englishName" : "Catalan; Valencian","name" : "Català"},
        {"code" : "ch","englishName" : "Chamorro","name" : "Chamoru"},
        {"code" : "ce","englishName" : "Chechen","name" : "нохчийн мотт"},
        {"code" : "ny","englishName" : "Chichewa; Chewa; Nyanja","name" : "chiCheŵa, chinyanja"},
        {"code" : "zh","englishName" : "Chinese","name" : "中文 (Zhōngwén), 汉语, 漢語"},
        {"code" : "cv","englishName" : "Chuvash","name" : "чӑваш чӗлхи"},
        {"code" : "kw","englishName" : "Cornish","name" : "Kernewek"},
        {"code" : "co","englishName" : "Corsican","name" : "corsu, lingua corsa"},
        {"code" : "cr","englishName" : "Cree","name" : "ᓀᐦᐃᔭᐍᐏᐣ"},
        {"code" : "hr","englishName" : "Croatian","name" : "hrvatski"},
        {"code" : "cs","englishName" : "Czech","name" : "česky, čeština"},
        {"code" : "da","englishName" : "Danish","name" : "dansk"},
        {"code" : "dv","englishName" : "Divehi; Dhivehi; Maldivian;","name" : "ދިވެހި"},
        {"code" : "nl","englishName" : "Dutch","name" : "Nederlands, Vlaams"},
        {"code" : "en","englishName" : "English","name" : "English"},
        {"code" : "eo","englishName" : "Esperanto","name" : "Esperanto"},
        {"code" : "et","englishName" : "Estonian","name" : "eesti, eesti keel"},
        {"code" : "ee","englishName" : "Ewe","name" : "Eʋegbe"},
        {"code" : "fo","englishName" : "Faroese","name" : "føroyskt"},
        {"code" : "fj","englishName" : "Fijian","name" : "vosa Vakaviti"},
        {"code" : "fi","englishName" : "Finnish","name" : "suomi, suomen kieli"},
        {"code" : "fr","englishName" : "French","name" : "français, langue française"},
        {"code" : "ff","englishName" : "Fula; Fulah; Pulaar; Pular","name" : "Fulfulde, Pulaar, Pular"},
        {"code" : "gl","englishName" : "Galician","name" : "Galego"},
        {"code" : "ka","englishName" : "Georgian","name" : "ქართული"},
        {"code" : "de","englishName" : "German","name" : "Deutsch"},
        {"code" : "el","englishName" : "Greek, Modern","name" : "Ελληνικά"},
        {"code" : "gn","englishName" : "Guaraní","name" : "Avañeẽ"},
        {"code" : "gu","englishName" : "Gujarati","name" : "ગુજરાતી"},
        {"code" : "ht","englishName" : "Haitian; Haitian Creole","name" : "Kreyòl ayisyen"},
        {"code" : "ha","englishName" : "Hausa","name" : "Hausa, هَوُسَ"},
        {"code" : "he","englishName" : "Hebrew (modern)","name" : "עברית"},
        {"code" : "hz","englishName" : "Herero","name" : "Otjiherero"},
        {"code" : "hi","englishName" : "Hindi","name" : "हिन्दी, हिंदी"},
        {"code" : "ho","englishName" : "Hiri Motu","name" : "Hiri Motu"},
        {"code" : "hu","englishName" : "Hungarian","name" : "Magyar"},
        {"code" : "ia","englishName" : "Interlingua","name" : "Interlingua"},
        {"code" : "id","englishName" : "Indonesian","name" : "Bahasa Indonesia"},
        {"code" : "ie","englishName" : "Interlingue","name" : "Originally called Occidental; then Interlingue after WWII"},
        {"code" : "ga","englishName" : "Irish","name" : "Gaeilge"},
        {"code" : "ig","englishName" : "Igbo","name" : "Asụsụ Igbo"},
        {"code" : "ik","englishName" : "Inupiaq","name" : "Iñupiaq, Iñupiatun"},
        {"code" : "io","englishName" : "Ido","name" : "Ido"},
        {"code" : "is","englishName" : "Icelandic","name" : "Íslenska"},
        {"code" : "it","englishName" : "Italian","name" : "Italiano"},
        {"code" : "iu","englishName" : "Inuktitut","name" : "ᐃᓄᒃᑎᑐᑦ"},
        {"code" : "ja","englishName" : "Japanese","name" : "日本語 (にほんご／にっぽんご)"},
        {"code" : "jv","englishName" : "Javanese","name" : "basa Jawa"},
        {"code" : "kl","englishName" : "Kalaallisut, Greenlandic","name" : "kalaallisut, kalaallit oqaasii"},
        {"code" : "kn","englishName" : "Kannada","name" : "ಕನ್ನಡ"},
        {"code" : "kr","englishName" : "Kanuri","name" : "Kanuri"},
        {"code" : "ks","englishName" : "Kashmiri","name" : "कश्मीरी, كشميري‎"},
        {"code" : "kk","englishName" : "Kazakh","name" : "Қазақ тілі"},
        {"code" : "km","englishName" : "Khmer","name" : "ភាសាខ្មែរ"},
        {"code" : "ki","englishName" : "Kikuyu, Gikuyu","name" : "Gĩkũyũ"},
        {"code" : "rw","englishName" : "Kinyarwanda","name" : "Ikinyarwanda"},
        {"code" : "ky","englishName" : "Kirghiz, Kyrgyz","name" : "кыргыз тили"},
        {"code" : "kv","englishName" : "Komi","name" : "коми кыв"},
        {"code" : "kg","englishName" : "Kongo","name" : "KiKongo"},
        {"code" : "ko","englishName" : "Korean","name" : "한국어 (韓國語), 조선말 (朝鮮語)"},
        {"code" : "ku","englishName" : "Kurdish","name" : "Kurdî, كوردی‎"},
        {"code" : "kj","englishName" : "Kwanyama, Kuanyama","name" : "Kuanyama"},
        {"code" : "la","englishName" : "Latin","name" : "latine, lingua latina"},
        {"code" : "lb","englishName" : "Luxembourgish, Letzeburgesch","name" : "Lëtzebuergesch"},
        {"code" : "lg","englishName" : "Luganda","name" : "Luganda"},
        {"code" : "li","englishName" : "Limburgish, Limburgan, Limburger","name" : "Limburgs"},
        {"code" : "ln","englishName" : "Lingala","name" : "Lingála"},
        {"code" : "lo","englishName" : "Lao","name" : "ພາສາລາວ"},
        {"code" : "lt","englishName" : "Lithuanian","name" : "lietuvių kalba"},
        {"code" : "lu","englishName" : "Luba-Katanga","name" : ""},
        {"code" : "lv","englishName" : "Latvian","name" : "latviešu valoda"},
        {"code" : "gv","englishName" : "Manx","name" : "Gaelg, Gailck"},
        {"code" : "mk","englishName" : "Macedonian","name" : "македонски јазик"},
        {"code" : "mg","englishName" : "Malagasy","name" : "Malagasy fiteny"},
        {"code" : "ms","englishName" : "Malay","name" : "bahasa Melayu, بهاس ملايو‎"},
        {"code" : "ml","englishName" : "Malayalam","name" : "മലയാളം"},
        {"code" : "mt","englishName" : "Maltese","name" : "Malti"},
        {"code" : "mi","englishName" : "Māori","name" : "te reo Māori"},
        {"code" : "mr","englishName" : "Marathi (Marāṭhī)","name" : "मराठी"},
        {"code" : "mh","englishName" : "Marshallese","name" : "Kajin M̧ajeļ"},
        {"code" : "mn","englishName" : "Mongolian","name" : "монгол"},
        {"code" : "na","englishName" : "Nauru","name" : "Ekakairũ Naoero"},
        {"code" : "nv","englishName" : "Navajo, Navaho","name" : "Diné bizaad, Dinékʼehǰí"},
        {"code" : "nb","englishName" : "Norwegian Bokmål","name" : "Norsk bokmål"},
        {"code" : "nd","englishName" : "North Ndebele","name" : "isiNdebele"},
        {"code" : "ne","englishName" : "Nepali","name" : "नेपाली"},
        {"code" : "ng","englishName" : "Ndonga","name" : "Owambo"},
        {"code" : "nn","englishName" : "Norwegian Nynorsk","name" : "Norsk nynorsk"},
        {"code" : "no","englishName" : "Norwegian","name" : "Norsk"},
        {"code" : "ii","englishName" : "Nuosu","name" : "ꆈꌠ꒿ Nuosuhxop"},
        {"code" : "nr","englishName" : "South Ndebele","name" : "isiNdebele"},
        {"code" : "oc","englishName" : "Occitan","name" : "Occitan"},
        {"code" : "oj","englishName" : "Ojibwe, Ojibwa","name" : "ᐊᓂᔑᓈᐯᒧᐎᓐ"},
        {"code" : "cu","englishName" : "Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic","name" : "ѩзыкъ словѣньскъ"},
        {"code" : "om","englishName" : "Oromo","name" : "Afaan Oromoo"},
        {"code" : "or","englishName" : "Oriya","name" : "ଓଡ଼ିଆ"},
        {"code" : "os","englishName" : "Ossetian, Ossetic","name" : "ирон æвзаг"},
        {"code" : "pa","englishName" : "Panjabi, Punjabi","name" : "ਪੰਜਾਬੀ, پنجابی‎"},
        {"code" : "pi","englishName" : "Pāli","name" : "पाऴि"},
        {"code" : "fa","englishName" : "Persian","name" : "فارسی"},
        {"code" : "pl","englishName" : "Polish","name" : "polski"},
        {"code" : "ps","englishName" : "Pashto, Pushto","name" : "پښتو"},
        {"code" : "pt","englishName" : "Portuguese","name" : "Português"},
        {"code" : "qu","englishName" : "Quechua","name" : "Runa Simi, Kichwa"},
        {"code" : "rm","englishName" : "Romansh","name" : "rumantsch grischun"},
        {"code" : "rn","englishName" : "Kirundi","name" : "kiRundi"},
        {"code" : "ro","englishName" : "Romanian, Moldavian, Moldovan","name" : "română"},
        {"code" : "ru","englishName" : "Russian","name" : "русский язык"},
        {"code" : "sa","englishName" : "Sanskrit (Saṁskṛta)","name" : "संस्कृतम्"},
        {"code" : "sc","englishName" : "Sardinian","name" : "sardu"},
        {"code" : "sd","englishName" : "Sindhi","name" : "सिन्धी, سنڌي، سندھی‎"},
        {"code" : "se","englishName" : "Northern Sami","name" : "Davvisámegiella"},
        {"code" : "sm","englishName" : "Samoan","name" : "gagana faa Samoa"},
        {"code" : "sg","englishName" : "Sango","name" : "yângâ tî sängö"},
        {"code" : "sr","englishName" : "Serbian","name" : "српски језик"},
        {"code" : "gd","englishName" : "Scottish Gaelic; Gaelic","name" : "Gàidhlig"},
        {"code" : "sn","englishName" : "Shona","name" : "chiShona"},
        {"code" : "si","englishName" : "Sinhala, Sinhalese","name" : "සිංහල"},
        {"code" : "sk","englishName" : "Slovak","name" : "slovenčina"},
        {"code" : "sl","englishName" : "Slovene","name" : "slovenščina"},
        {"code" : "so","englishName" : "Somali","name" : "Soomaaliga, af Soomaali"},
        {"code" : "st","englishName" : "Southern Sotho","name" : "Sesotho"},
        {"code" : "es","englishName" : "Spanish; Castilian","name" : "español, castellano"},
        {"code" : "su","englishName" : "Sundanese","name" : "Basa Sunda"},
        {"code" : "sw","englishName" : "Swahili","name" : "Kiswahili"},
        {"code" : "ss","englishName" : "Swati","name" : "SiSwati"},
        {"code" : "sv","englishName" : "Swedish","name" : "svenska"},
        {"code" : "ta","englishName" : "Tamil","name" : "தமிழ்"},
        {"code" : "te","englishName" : "Telugu","name" : "తెలుగు"},
        {"code" : "tg","englishName" : "Tajik","name" : "тоҷикӣ, toğikī, تاجیکی‎"},
        {"code" : "th","englishName" : "Thai","name" : "ไทย"},
        {"code" : "ti","englishName" : "Tigrinya","name" : "ትግርኛ"},
        {"code" : "bo","englishName" : "Tibetan Standard, Tibetan, Central","name" : "བོད་ཡིག"},
        {"code" : "tk","englishName" : "Turkmen","name" : "Türkmen, Түркмен"},
        {"code" : "tl","englishName" : "Tagalog","name" : "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔"},
        {"code" : "tn","englishName" : "Tswana","name" : "Setswana"},
        {"code" : "to","englishName" : "Tonga (Tonga Islands)","name" : "faka Tonga"},
        {"code" : "tr","englishName" : "Turkish","name" : "Türkçe"},
        {"code" : "ts","englishName" : "Tsonga","name" : "Xitsonga"},
        {"code" : "tt","englishName" : "Tatar","name" : "татарча, tatarça, تاتارچا‎"},
        {"code" : "tw","englishName" : "Twi","name" : "Twi"},
        {"code" : "ty","englishName" : "Tahitian","name" : "Reo Tahiti"},
        {"code" : "ug","englishName" : "Uighur, Uyghur","name" : "Uyƣurqə, ئۇيغۇرچە‎"},
        {"code" : "uk","englishName" : "Ukrainian","name" : "українська"},
        {"code" : "ur","englishName" : "Urdu","name" : "اردو"},
        {"code" : "uz","englishName" : "Uzbek","name" : "zbek, Ўзбек, أۇزبېك‎"},
        {"code" : "ve","englishName" : "Venda","name" : "Tshivenḓa"},
        {"code" : "vi","englishName" : "VietenglishNamese","name" : "Tiếng Việt"},
        {"code" : "vo","englishName" : "Volapük","name" : "Volapük"},
        {"code" : "wa","englishName" : "Walloon","name" : "Walon"},
        {"code" : "cy","englishName" : "Welsh","name" : "Cymraeg"},
        {"code" : "wo","englishName" : "Wolof","name" : "Wollof"},
        {"code" : "fy","englishName" : "Western Frisian","name" : "Frysk"},
        {"code" : "xh","englishName" : "Xhosa","name" : "isiXhosa"},
        {"code" : "yi","englishName" : "Yiddish","name" : "ייִדיש"},
        {"code" : "yo","englishName" : "Yoruba","name" : "Yorùbá"},
        {"code" : "za","englishName" : "Zhuang, Chuang","name" : "Saɯ cueŋƅ, Saw cuengh"}
    ];
}
