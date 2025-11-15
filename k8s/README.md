# Manifiestos de Kubernetes

## ⚠️ Archivos de Secrets

Los archivos `*-secret.yaml` **NO están en Git** por seguridad.

### Configuración inicial de secrets:

```bash
# 1. Copia los templates
cp postgres-secret.yaml.example postgres-secret.yaml
cp users-service-secret.yaml.example users-service-secret.yaml

# 2. Edita con contraseñas reales
# - postgres-secret.yaml
# - users-service-secret.yaml

# 3. NO hagas commit de estos archivos (están en .gitignore)
```

### Generar secrets seguros:

```bash
# JWT Secret
openssl rand -base64 32

# O en PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 📁 Estructura

```
k8s/
├── postgres-configmap.yaml           ✅ Safe (sin contraseñas)
├── postgres-secret.yaml              ❌ NO SUBIR (en .gitignore)
├── postgres-secret.yaml.example      ✅ Template público
├── postgres-pvc.yaml                 ✅ Safe
├── postgres-statefulset.yaml         ✅ Safe
├── postgres-service.yaml             ✅ Safe
├── users-service-configmap.yaml      ✅ Safe (sin contraseñas)
├── users-service-secret.yaml         ❌ NO SUBIR (en .gitignore)
├── users-service-secret.yaml.example ✅ Template público
├── users-service-deployment.yaml     ✅ Safe
├── users-service-service.yaml        ✅ Safe
├── users-service-ingress.yaml        ✅ Safe
├── users-service-hpa.yaml            ✅ Safe
└── cert-manager-issuer.yaml          ✅ Safe
```

## 🔐 Buenas Prácticas

1. **NUNCA** hagas commit de archivos `*-secret.yaml`
2. Usa **templates** (`.example`) en Git
3. Documenta qué secrets se necesitan
4. Para producción, considera usar:
   - **HashiCorp Vault**
   - **AWS Secrets Manager**
   - **Azure Key Vault**
   - **Sealed Secrets** (Bitnami)

## 🚀 Deployment

Los scripts de deployment esperan que los archivos `*-secret.yaml` existan localmente.

```bash
# Verificar que los secrets existen antes de deployar
ls *-secret.yaml

# Si no existen, créalos desde los templates
```
