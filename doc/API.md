# UNEP GPML API

This is the API that powers the UNEP GPML Digital Platform. This API
will allow you to peform any actions that you can perform on the
website, through an API client.

Detailed documentation for the API is available through a Swagger
powered page at
[https://globalplasticshub.org/api/docs/index.html](https://globalplasticshub.org/api/docs/index.html).

## Fetching Data

You can fetch the data for all the resources, visible on the Browse
page, via the [browse
endpoint](https://globalplasticshub.org/api/docs/index.html#/browse). All
the publicly available information can be fetched without
authenticating your requests. To fetch information about organisations
or individuals, the API requests would need to be authenticated.

## Translations

The platform supports automatic translation of resources into multiple languages
using the bulk translations endpoint. When auto-translation is enabled,
translations are automatically generated using Google Translate API and cached
for future requests.

**See:** [Auto-Translation API Documentation](./API_AUTO_TRANSLATION.md) for
detailed information on:
- How to request translations for multiple resources
- Automatic translation behavior
- Source language detection
- Performance characteristics
- Cost estimation
- Supported languages

## Creating and Updating Data

All requests for updating existing resources, or creating new ones,
would need to be authenticated. Separate end-points are provided for
each resource type to create and update them.

## Authentication

The UNEP GPML Digital Platform uses Auth0 for authenticating users.
Any API calls that require authentication would also need to
authenticate with Auth0 and use the OAuth2 Access Token in the
Authorization request header field. More details on authentication can
be found
[here](https://auth0.com/docs/api/authentication#authentication-methods)
