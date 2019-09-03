const config = {
  tls: {
    /* Enable server-only TLS; i.e. serve on HTTPS instead of HTTP. */
    enabled: false,
    mutualTLS: {
      /*
      Enable mutual TLS authentication. Useful when the simulator is not running in a Mojaloop
      environment, i.e. when you're running it locally against your own implementation.
      */
      enabled: false,
    },
  },
  
  
  /* Location of   certs and key required for TLS */
  CA_CERT_PATH: './secrets/cacert.pem',
  SERVER_CERT_PATH: './secrets/servercert.pem',
  SERVER_KEY_PAT: './secrets/serverkey.pem',
    
  /*
   The number of space characters by which to indent pretty - printed logs.If set to zero, log events
   will each be printed on a single line. 
   */
  LOG_INDENT: 0,

  /*
   The name of the sqlite log file. This probably doesn't matter much to the user, except that
   setting :memory: will use an in-memory sqlite db, which will be faster and not consume disk
   space. However, it will also mean that the logs will be lost once the container is stopped.
  */
  SQLITE_LOG_FILE: ':memory:',

  /*
   The name of the sqlite model database. If you would like to start the simulator with preloaded
   state you can use a preexisting file. If running in a container, you can mount a sqlite file as a
   volume in the container to preserve state between runs.
  */
  MODEL_DATABASE: './model.sqlite',
   
  /* Outbound API endpoint (It might be a container in the compose file so remember the networking IP */
  OUTBOUND_ENDPOINT: 'http://scheme-adapter:3001',

  DFSP_ID: 'golden',
  FEE_MULTIPLIER: 0.05,
  RULES_FILE: './rules.json',

  /* Ports for each api server to listen on */
  SIMULATOR_PORT: 3000,
  REPORT_PORT: 3002,
  TEST_API_PORT: 3003,
}

module.exports = config