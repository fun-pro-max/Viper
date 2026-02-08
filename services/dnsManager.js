export const JIO_STRIKE_NODES = [
    { 
        url: 'https://www.google.com/generate_204', 
        name: 'Jio-Google Anchor', 
        id: 'jio_g',
        isAnchor: true 
    },
    { 
        url: 'https://1.1.1.1/cdn-cgi/trace', 
        name: 'Jio-CF Peering', 
        id: 'jio_cf'
    },
    { 
        url: 'https://www.jio.com/favicon.ico', 
        name: 'Jio Odisha Core', 
        id: 'jio_local'
    }
];

export function getJioNodes() { return JIO_STRIKE_NODES; }