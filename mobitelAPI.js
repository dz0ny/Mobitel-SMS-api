(function (window, undefined)
{
window.MobitelAPI = function (_uporabnik,_geslo) {
	this.uporabnik = _uporabnik;
	this.geslo = _geslo;
}
window.MobitelAPI.prototype = {
    prijavljen: false,
    request: function (action, data, callback) {
        if (this.prijavljen) {
            if (jQuery) {
                jQuery.ajax({
                    url: "https://moj.mobitel.si/mobidesktop-v2/service",
                    processData: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("SOAPAction", "http://mobitel.si/MobiDesktop/" + action);
                    },
                    contentType: "text/xml",
                    data: data,
                    type: "POST",
                    dataType: "xml",
                    success: function (xml) {
                        callback(xml);
                    }
                });
            }
            else if (XMLHttpRequest) {
                var xhr = new XMLHttpRequest();
                xhr.setRequestHeader("SOAPAction", "http://mobitel.si/MobiDesktop/" + action);
                xhr.setRequestHeader("Content-type", "text/xml");
                xhr.setRequestHeader("Connection", "close");
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        callback(this.responseText);
                    }
                };
                xhr.open("POST", "https://moj.mobitel.si/mobidesktop-v2/service");
                xhr.send();
            }
            else {
                throw "Okolje ni podprto!";
            }
        } else {
            callback(false);
        }
    },
    prijava: function (uporabnik, geslo, callback) {
        if (this.prijavljen) {
            callback(this.prijavljen);
        } else {
            var that = this;
            var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mob="http://mobitel.si/MobiDesktop"><soapenv:Header/><soapenv:Body><mob:AuthenticateUser><mob:Username>' + uporabnik + '</mob:Username><mob:Password>' + geslo + '</mob:Password></mob:AuthenticateUser></soapenv:Body></soapenv:Envelope>';
            that.prijavljen = true;
            this.request("AuthenticateUser", data, function (xml) {
                if (jQuery("AuthenticateUserResult", xml).text() == "0") {
                    that.uporabnik = uporabnik;
                    that.geslo = geslo;
                } else {
                    that.prijavljen = false;
                }
                callback(that.prijavljen);
            });
        }
    },
    Monitor: function (podatki) {
        var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mob="http://mobitel.si/MobiDesktop"><soapenv:Header/><soapenv:Body><mob:Monitor><mob:Username>' + this.uporabnik + '</mob:Username><mob:Password>' + this.geslo + '</mob:Password></mob:Monitor></soapenv:Body></soapenv:Envelope>';
        this.request("Monitor", data, podatki);
    },
    SendSMS: function (telefon, sporocilo, callback) {
        var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mob="http://mobitel.si/MobiDesktop"><soapenv:Header/><soapenv:Body><mob:SendSMS><mob:Username>' + this.uporabnik + '</mob:Username><mob:Password>' + this.geslo + '</mob:Password><mob:Recipients><mob:string>' + telefon + '</mob:string></mob:Recipients><mob:Message>' + sporocilo + '</mob:Message></mob:SendSMS></soapenv:Body></soapenv:Envelope>';
        this.request("SendSMS", data, function (xml) {
            if (jQuery("SendSMSResult", xml).text() == "true") {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    getImenik: function (callback) {
        var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mob="http://mobitel.si/MobiDesktop"><soapenv:Header/><soapenv:Body><mob:GetMRokovnikContacts><mob:Username>' + this.uporabnik + '</mob:Username><mob:Password>' + this.geslo + '</mob:Password><mob:index>0</mob:index><mob:Count>1000</mob:Count></mob:GetMRokovnikContacts></soapenv:Body></soapenv:Envelope>';
        this.request("GetMRokovnikContacts", data, function (xml) {
            var imenik = [];
            jQuery("GetMRokovnikContactsResult", xml).find('Contact').each(function (index) {
                var ime = jQuery(this).find('givenNameField').text();
                var priimek = jQuery(this).find('familyNameField').text();
                var telefon = jQuery(this).find('telephoneNumberField').text();
                imenik.push({
                    ime: ime,
                    priimek: priimek,
                    telefon: telefon
                });
            });
            if (imenik.length > 0) {
                callback(imenik);
            } else {
                callback(false);
            }
        });
    }
};
})(window);