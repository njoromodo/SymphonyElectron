'use strict';

const { getGlobalConfigField } = require('./../config.js');
const parseDomain = require('parse-domain');
const isEqual = require('lodash.isequal');

/**
 * Loops through the list of whitelist urls
 * @param url {String} - url the electron is navigated to
 * @returns {Promise}
 */
function isWhitelisted(url) {

    return new Promise((resolve, reject) => {
        getGlobalConfigField('whitelistUrl').then((whitelist) => {

            if (checkWhitelist(url, whitelist)) {
                return resolve();
            }

            return reject(new Error('URL does not match with the whitelist'));

        }).catch((err) => {
            reject(err);
        });
    });
}

/**
 * Method that compares url against a list of whitelist
 * returns true if hostName or domain present in the whitelist
 * @param url {String} - url the electron is navigated to
 * @param whitelist {String} - coma separated whitelists
 * @returns {boolean}
 */
function checkWhitelist(url, whitelist) {
    let whitelistArray = whitelist.split(',');
    const parsedUrl = parseDomain(url);

    if (!parsedUrl) {
        return false;
    }

    if (!whitelist) {
        return false;
    }

    if (!whitelistArray.length || whitelistArray.indexOf('*') !== -1) {
        return true;
    }

    return whitelistArray.some((whitelistHost) => {
        let parsedWhitelist = parseDomain(whitelistHost);

        if (!parsedWhitelist) {
            return false;
        }

        return matchDomains(parsedUrl, parsedWhitelist);
    });
}

/**
 * Matches the respective hostName
 * @param parsedUrl {Object} - parsed url
 * @param parsedWhitelist {Object} - parsed whitelist
 *
 * example:
 * matchDomain({ subdomain: www, domain: example, tld: com }, { subdomain: app, domain: example, tld: com })
 *
 * @returns {*}
 */
function matchDomains(parsedUrl, parsedWhitelist) {

    if (isEqual(parsedUrl, parsedWhitelist)) {
        return true;
    }

    const hostNameFromUrl = parsedUrl.domain + parsedUrl.tld;
    const hostNameFromWhitelist = parsedWhitelist.domain + parsedWhitelist.tld;

    if (!parsedWhitelist.subdomain) {
        return hostNameFromUrl === hostNameFromWhitelist
    }

    return hostNameFromUrl === hostNameFromWhitelist && matchSubDomains(parsedUrl.subdomain, parsedWhitelist.subdomain);

}

/**
 * Matches the last occurrence in the sub-domain
 * @param subDomainUrl {String} - sub-domain from url
 * @param subDomainWhitelist {String} - sub-domain from whitelist
 *
 * example: matchSubDomains('www', 'app')
 *
 * @returns {boolean}
 */
function matchSubDomains(subDomainUrl, subDomainWhitelist) {

    if (subDomainUrl === subDomainWhitelist) {
        return true;
    }

    const subDomainUrlArray = subDomainUrl.split('.');
    const lastCharSubDomainUrl = subDomainUrlArray[subDomainUrlArray.length - 1];

    const subDomainWhitelistArray = subDomainWhitelist.split('.');
    const lastCharWhitelist = subDomainWhitelistArray[subDomainWhitelistArray.length - 1];

    return lastCharSubDomainUrl === lastCharWhitelist;
}

module.exports = {
    isWhitelisted,

    // items below here are only exported for testing, do NOT use!
    checkWhitelist

};
