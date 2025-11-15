# Script de deployment rápido para Kubernetes
# Uso: .\deploy.ps1 [apply|delete|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("apply", "delete", "status", "logs", "restart")]
    [string]$Action = "status"
)

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Configurar kubeconfig
$env:KUBECONFIG = ".\kubeconfig.yaml"

# Verificar que kubectl está instalado
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "❌ kubectl no está instalado. Instálalo primero."
    exit 1
}

# Verificar conexión al cluster
Write-Info "🔍 Verificando conexión al cluster..."
kubectl cluster-info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ No se pudo conectar al cluster. Verifica tu kubeconfig.yaml"
    exit 1
}
Write-Success "✅ Conectado al cluster"

switch ($Action) {
    "apply" {
        Write-Info "`n📦 Desplegando microservicio de usuarios...`n"
        
        # PostgreSQL
        Write-Info "1️⃣  Desplegando PostgreSQL..."
        kubectl apply -f k8s/postgres-configmap.yaml
        kubectl apply -f k8s/postgres-secret.yaml
        kubectl apply -f k8s/postgres-pvc.yaml
        kubectl apply -f k8s/postgres-statefulset.yaml
        kubectl apply -f k8s/postgres-service.yaml
        
        Write-Info "⏳ Esperando a que PostgreSQL esté listo..."
        kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ PostgreSQL está listo"
        } else {
            Write-Warning "⚠️  PostgreSQL tardó más de lo esperado"
        }
        
        # Users Service
        Write-Info "`n2️⃣  Desplegando Users Service..."
        kubectl apply -f k8s/users-service-configmap.yaml
        kubectl apply -f k8s/users-service-secret.yaml
        kubectl apply -f k8s/users-service-deployment.yaml
        kubectl apply -f k8s/users-service-service.yaml
        kubectl apply -f k8s/users-service-ingress.yaml
        kubectl apply -f k8s/users-service-hpa.yaml
        
        Write-Info "⏳ Esperando rollout del deployment..."
        kubectl rollout status deployment/users-service --timeout=300s
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "`n✅ Despliegue completado exitosamente!"
        } else {
            Write-Error "`n❌ El despliegue falló. Revisa los logs."
            exit 1
        }
        
        # Mostrar información
        Write-Info "`n📊 Estado del deployment:"
        kubectl get pods -l app=users-service
        kubectl get ingress users-service-ingress
        
        Write-Success "`n🎉 URL del servicio: https://users.inf326.nursoft.dev"
        Write-Success "📚 Swagger docs: https://users.inf326.nursoft.dev/docs"
    }
    
    "delete" {
        Write-Warning "`n⚠️  ¿Estás seguro de eliminar el deployment? (S/N)"
        $confirm = Read-Host
        if ($confirm -ne "S") {
            Write-Info "Operación cancelada"
            exit 0
        }
        
        Write-Info "`n🗑️  Eliminando microservicio de usuarios..."
        
        kubectl delete -f k8s/users-service-hpa.yaml --ignore-not-found=true
        kubectl delete -f k8s/users-service-ingress.yaml --ignore-not-found=true
        kubectl delete -f k8s/users-service-service.yaml --ignore-not-found=true
        kubectl delete -f k8s/users-service-deployment.yaml --ignore-not-found=true
        kubectl delete -f k8s/users-service-secret.yaml --ignore-not-found=true
        kubectl delete -f k8s/users-service-configmap.yaml --ignore-not-found=true
        
        kubectl delete -f k8s/postgres-service.yaml --ignore-not-found=true
        kubectl delete -f k8s/postgres-statefulset.yaml --ignore-not-found=true
        kubectl delete -f k8s/postgres-secret.yaml --ignore-not-found=true
        kubectl delete -f k8s/postgres-configmap.yaml --ignore-not-found=true
        
        Write-Warning "`n⚠️  ¿Eliminar también el PVC de PostgreSQL? (esto borrará los datos) (S/N)"
        $confirmPVC = Read-Host
        if ($confirmPVC -eq "S") {
            kubectl delete -f k8s/postgres-pvc.yaml --ignore-not-found=true
            Write-Info "PVC eliminado"
        }
        
        Write-Success "`n✅ Deployment eliminado"
    }
    
    "status" {
        Write-Info "`n📊 Estado del deployment:`n"
        
        Write-Info "=== PostgreSQL ==="
        kubectl get pods -l app=postgres
        kubectl get pvc postgres-pvc
        
        Write-Info "`n=== Users Service ==="
        kubectl get pods -l app=users-service
        kubectl get svc users-service
        kubectl get ingress users-service-ingress
        kubectl get hpa users-service-hpa
        
        Write-Info "`n=== Métricas (si están disponibles) ==="
        kubectl top pods -l app=users-service --use-protocol-buffers 2>$null
        
        Write-Info "`n=== URLs ==="
        Write-Success "🌐 API: https://users.inf326.nursoft.dev"
        Write-Success "📚 Docs: https://users.inf326.nursoft.dev/docs"
    }
    
    "logs" {
        Write-Info "`n📋 Logs del microservicio (Ctrl+C para salir):`n"
        kubectl logs -f deployment/users-service --all-containers=true
    }
    
    "restart" {
        Write-Info "`n🔄 Reiniciando deployment..."
        kubectl rollout restart deployment/users-service
        kubectl rollout status deployment/users-service
        Write-Success "✅ Deployment reiniciado"
    }
}
