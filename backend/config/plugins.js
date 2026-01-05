const isEmpty = value => {
  return (
    value == null ||  // use `==` to check for null || undefined
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}

module.exports = ({ env }) => {
  const emailConfig = (!isEmpty(env('SMTP_HOST')) && !isEmpty(env('SMTP_USERNAME')) && !isEmpty(env('SMTP_PASSWORD')))
    ? {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env('SMTP_PORT'),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
    } : {
      provider: 'nodemailer',
      providerOptions: {
        host: 'mailpit',
        port: 1025,
        ignoreTLS: true,
        auth: false,
      },
    };

  const uploadConfig = (!isEmpty(env.json('GCS_SERVICE_ACCOUNT')))
    ? {
      provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        serviceAccount: env.json('GCS_SERVICE_ACCOUNT'),
        bucketName: env('GCS_BUCKET_NAME'),
        basePath: env('GCS_BASE_PATH'),
        baseUrl: env('GCS_BASE_URL'),
        publicFiles: env('GCS_PUBLIC_FILES'),
        uniform: env('GCS_UNIFORM'),
        skipCheckBucket: true,
      },
    } : {};

  return {
    email: {
      config: {
        ...emailConfig,
        settings: {
          defaultFrom: env('SMTP_FROM'),
          defaultReplyTo: env('SMTP_FROM'),
        },
      },
    },
    upload: {
      config: {
        ...uploadConfig,
        sizeLimit: 250 * 1024 * 1024,
      },
    },
  };
};
