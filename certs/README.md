# Certificados SSL locais (desenvolvimento)

Para habilitar HTTPS local no Vite, gere um certificado autoassinado e configure os caminhos no `.env.development`:

```
VITE_DEV_HTTPS=true
VITE_DEV_SSL_KEY_PATH=./certs/localhost.key
VITE_DEV_SSL_CERT_PATH=./certs/localhost.crt
```

## Windows (PowerShell)

1. Gere um certificado autoassinado para `localhost`:

```
New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\LocalMachine\\My"
```

2. Exportar o certificado e a chave:

- Abra o `certmgr.msc`, localize em `Certificados (Local Computer) > Personal > Certificates`.
- Exporte o certificado com a chave privada para `.pfx`.

3. Converta `.pfx` em `.key` e `.crt` (requer OpenSSL):

```
openssl pkcs12 -in localhost.pfx -nocerts -out localhost.key -nodes
openssl pkcs12 -in localhost.pfx -clcerts -nokeys -out localhost.crt
```

4. Coloque `localhost.key` e `localhost.crt` neste diretório `certs/`.

## Alternativa (mkcert)

Se tiver `mkcert` instalado:

```
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

Renomeie os arquivos gerados para `localhost.key` e `localhost.crt` e ajuste os caminhos no `.env.development`.

## Observações

- Navegadores podem exibir aviso de segurança em certificados autoassinados.
- Use HTTPS local apenas quando necessário (ex.: testar APIs que exigem HTTPS).
