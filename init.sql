
CREATE TABLE IF NOT EXISTS fsp (
    fspId INT(10) unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(256) NOT NULL,
    `mobileCountryCode` SMALLINT unsigned NOT NULL COMMENT 'The three digit code representing the MCC returned by Pathfinder',
    `mobileNetworkCode` SMALLINT unsigned NOT NULL COMMENT 'The three digit code representing the MNC returned by Pathfinder'
);

CREATE TABLE IF NOT EXISTS quote (
    quoteId VARCHAR(36) NOT NULL PRIMARY KEY,
    payerFsp INT(10) unsigned NOT NULL,
    payeeFsp INT(10) unsigned NOT NULL,
    payerParty INT(10) unsigned DEFAULT NULL,
    payeeParty INT(10) unsigned DEFAULT NULL,
    hash VARCHAR(255) NULL COMMENT 'hash value received for the quote response',
    createdDate DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'System dateTime stamp pertaining to the inserted record',
    CONSTRAINT quote_payerparty_fk FOREIGN KEY (payerParty) REFERENCES party (id),
    CONSTRAINT quote_payeeparty_fk FOREIGN KEY (payeeParty) REFERENCES party (id),
    CONSTRAINT quote_payerfsp_fk FOREIGN KEY (payerFsp) REFERENCES fsp (id),
    CONSTRAINT quote_payeefsp_fk FOREIGN KEY (payeeFsp) REFERENCES fsp (id)
);

CREATE TABLE IF NOT EXISTS transfer (
    transferId INT(10) unsigned NOT NULL,
    quoteId VARCHAR(36) NOT NULL,
    CONSTRAINT transfer_quoteid_fk FOREIGN KEY (quoteId) REFERENCES quote (quoteId)
);

CREATE TABLE IF NOT EXISTS party (
    partyId INT(10) NOT NULL PRIMARY KEY,
    firstName VARCHAR(128) NULL,
    middleName VARCHAR(128) NULL,
    lastName VARCHAR(128) NULL,
    dateOfBirth DATETIME NULL
);
