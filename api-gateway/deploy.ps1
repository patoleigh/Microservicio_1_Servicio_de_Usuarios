# API Gateway Deployment Script
# PowerShell script para build y deploy del API Gateway

param(
    [string]$Action = "all",
    [string]$Tag = "latest"
)

$IMAGE_NAME = "ghcr.io/carlosvera81/api-gateway"
$IMAGE_TAG = "${IMAGE_NAME}:${Tag}"

function Build-Image {
    Write-Host "🏗️  Building Docker image..." -ForegroundColor Cyan
    docker build -t $IMAGE_TAG .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
}

function Push-Image {
    Write-Host "📤 Pushing image to registry..." -ForegroundColor Cyan
    docker push $IMAGE_TAG
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Push failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Push successful" -ForegroundColor Green
}

function Deploy-K8s {
    Write-Host "🚀 Deploying to Kubernetes..." -ForegroundColor Cyan
    
    $env:KUBECONFIG = "..\kubeconfig.yaml"
    
    # Apply manifests
    kubectl apply -f k8s/api-gateway-configmap.yaml
    kubectl apply -f k8s/api-gateway-secret.yaml
    kubectl apply -f k8s/api-gateway-deployment.yaml
    kubectl apply -f k8s/api-gateway-service.yaml
    kubectl apply -f k8s/api-gateway-ingress.yaml
    kubectl apply -f k8s/api-gateway-hpa.yaml
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Deployment successful" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Checking deployment status..." -ForegroundColor Cyan
    kubectl rollout status deployment/api-gateway
}

function Get-Status {
    Write-Host "📊 Getting deployment status..." -ForegroundColor Cyan
    $env:KUBECONFIG = "..\kubeconfig.yaml"
    
    Write-Host "`n=== Pods ===" -ForegroundColor Yellow
    kubectl get pods -l app=api-gateway
    
    Write-Host "`n=== Service ===" -ForegroundColor Yellow
    kubectl get svc api-gateway-service
    
    Write-Host "`n=== Ingress ===" -ForegroundColor Yellow
    kubectl get ingress api-gateway-ingress
    
    Write-Host "`n=== HPA ===" -ForegroundColor Yellow
    kubectl get hpa api-gateway-hpa
}

# Main execution
switch ($Action) {
    "build" {
        Build-Image
    }
    "push" {
        Push-Image
    }
    "deploy" {
        Deploy-K8s
    }
    "status" {
        Get-Status
    }
    "all" {
        Build-Image
        Push-Image
        Deploy-K8s
        Get-Status
    }
    default {
        Write-Host "Usage: .\deploy.ps1 [-Action <build|push|deploy|status|all>] [-Tag <version>]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Cyan
        Write-Host "  .\deploy.ps1 -Action all           # Build, push and deploy"
        Write-Host "  .\deploy.ps1 -Action build         # Only build image"
        Write-Host "  .\deploy.ps1 -Action deploy        # Only deploy to K8s"
        Write-Host "  .\deploy.ps1 -Action status        # Check deployment status"
        Write-Host "  .\deploy.ps1 -Action all -Tag v1.0 # Deploy with specific tag"
    }
}
