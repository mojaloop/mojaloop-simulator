const axios = require('axios')

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
}

describe('handlers', () => {
  it('GET /health', async () => {
    // Arrange
    const uri = `http://localhost:3000/health`
    const expected = { 
      status: 'OK'
    }
    
    // Act
    const result = (await axios.get(uri)).data
    
    // Assert
    expect(result).toStrictEqual(expected)
  })

  it('POST /validateConsentRequests returns the mock payload for consentRequestId `b51ec534-ee48-4575-b6a9-ead2955b8069`', async () => {
    // Arrange
    const payload = {
      "consentRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
      "userId": "dfspa.username",
      "scopes": [
        {
          "accountId": "dfspa.username.1234",
          "actions": [
            "accounts.transfer",
            "accounts.getBalance"
          ]
        },
        {
          "accountId": "dfspa.username.5678",
          "actions": [
            "accounts.transfer",
            "accounts.getBalance"
          ]
        }
      ],
      "authChannels": [
        "WEB",
        "OTP"
      ],
      "callbackUri": "pisp-app://callback.com"
    }
    const expected = {
      "isValid": true,
      "data": {
        "authChannels": [
          "WEB"
        ],
        "authUri": "http://localhost:6060/admin/dfsp/authorize?consentRequestId=b51ec534-ee48-4575-b6a9-ead2955b8069&callbackUri=http://localhost:42181/flutter-web-auth.html"
      }
    }
    const uri = `http://localhost:3000/validateConsentRequests`

    // Act
    const result = (await axios.post(uri, payload, axiosConfig)).data
        
    // Assert
    expect(result).toStrictEqual(expected)
  })
})