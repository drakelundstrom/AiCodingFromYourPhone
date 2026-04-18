param location string = resourceGroup().location
param webAppName string

resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: webAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
  }
}
