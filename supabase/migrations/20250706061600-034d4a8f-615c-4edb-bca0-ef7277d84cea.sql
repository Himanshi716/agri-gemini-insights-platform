-- Store the Infura API key securely
INSERT INTO vault.secrets (name, secret) 
VALUES ('INFURA_API_KEY', 'https://polygon-mainnet.infura.io/v3/24ef4bf1640e4eea99e33c9082e94228')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;