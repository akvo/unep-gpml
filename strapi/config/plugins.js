module.exports = ({ env }) => ({
    tinymce:{
        enabled:true
    },
    upload: {
      config: {
        provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
        providerOptions: {
          serviceAccount: env.json('GCS_SERVICE_ACCOUNT'),
          bucketName: env('GCS_BUCKET_NAME'),
          basePath: env('GCS_BASE_PATH'),
          baseUrl: env('GCS_BASE_URL'),
          publicFiles: env('GCS_PUBLIC_FILES'),
          uniform: env('GCS_UNIFORM'),
          skipCheckBucket: true
        },
      },
    },
    //...
});