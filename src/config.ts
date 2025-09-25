const host = () => {
    const env: Record<string, string | undefined> = {
        SIT: import.meta.env.VITE_HOST_URL_SIT,
        DEV: import.meta.env.VITE_HOST_URL_DEV,
        PROD: import.meta.env.VITE_HOST_URL_PROD,
        UAT: import.meta.env.VITE_HOST_URL_UAT,
        PREPROD: import.meta.env.VITE_HOST_URL_PREPROD,

    };
    const currentEnvironment = import.meta.env.VITE_APP_PUBLIC_ENV || "DEV";
    return env[currentEnvironment];
};

const config = {
    API_URL: 'http://' + host() + '/api',
    PUBLIC_URL: 'http://' + host() + ':5173/',
}

export default config
