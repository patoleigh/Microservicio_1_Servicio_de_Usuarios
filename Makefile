# Makefile para Microservicio de Usuarios
# Uso: make [comando]

.PHONY: help install run test docker-build docker-up docker-down k8s-deploy k8s-delete k8s-status k8s-logs

# Variables
IMAGE_NAME := ghcr.io/carlosvera81/microservicio_1_servicio_de_usuarios
IMAGE_TAG := latest
KUBECONFIG_PATH := ./kubeconfig.yaml

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === Desarrollo local ===

install: ## Instalar dependencias de Python
	python -m pip install --upgrade pip
	pip install -r requirements.txt

run: ## Ejecutar el servidor en modo desarrollo
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test: ## Ejecutar tests (cuando estén implementados)
	pytest -v

migrate: ## Ejecutar migraciones de Alembic
	alembic upgrade head

migrate-create: ## Crear una nueva migración (usar: make migrate-create MESSAGE="descripción")
	alembic revision -m "$(MESSAGE)" --autogenerate

# === Docker ===

docker-build: ## Construir imagen Docker
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-push: ## Subir imagen a GitHub Container Registry
	docker push $(IMAGE_NAME):$(IMAGE_TAG)

docker-up: ## Levantar con docker-compose
	docker-compose up --build

docker-down: ## Detener docker-compose
	docker-compose down

docker-logs: ## Ver logs de docker-compose
	docker-compose logs -f

# === Kubernetes ===

k8s-deploy: ## Desplegar en Kubernetes
	@echo "📦 Desplegando en Kubernetes..."
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl apply -f k8s/postgres-configmap.yaml && \
	kubectl apply -f k8s/postgres-secret.yaml && \
	kubectl apply -f k8s/postgres-pvc.yaml && \
	kubectl apply -f k8s/postgres-statefulset.yaml && \
	kubectl apply -f k8s/postgres-service.yaml && \
	echo "⏳ Esperando PostgreSQL..." && \
	kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s && \
	kubectl apply -f k8s/users-service-configmap.yaml && \
	kubectl apply -f k8s/users-service-secret.yaml && \
	kubectl apply -f k8s/users-service-deployment.yaml && \
	kubectl apply -f k8s/users-service-service.yaml && \
	kubectl apply -f k8s/users-service-ingress.yaml && \
	kubectl apply -f k8s/users-service-hpa.yaml && \
	echo "⏳ Esperando deployment..." && \
	kubectl rollout status deployment/users-service --timeout=300s && \
	echo "✅ Despliegue completado"

k8s-delete: ## Eliminar deployment de Kubernetes
	@echo "🗑️  Eliminando deployment..."
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl delete -f k8s/users-service-hpa.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/users-service-ingress.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/users-service-service.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/users-service-deployment.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/users-service-secret.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/users-service-configmap.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/postgres-service.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/postgres-statefulset.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/postgres-secret.yaml --ignore-not-found=true && \
	kubectl delete -f k8s/postgres-configmap.yaml --ignore-not-found=true && \
	echo "✅ Deployment eliminado"

k8s-status: ## Ver estado del deployment en Kubernetes
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	echo "=== PostgreSQL ===" && \
	kubectl get pods -l app=postgres && \
	kubectl get pvc postgres-pvc && \
	echo "" && \
	echo "=== Users Service ===" && \
	kubectl get pods -l app=users-service && \
	kubectl get svc users-service && \
	kubectl get ingress users-service-ingress && \
	kubectl get hpa users-service-hpa

k8s-logs: ## Ver logs del microservicio en Kubernetes
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl logs -f deployment/users-service --all-containers=true

k8s-logs-postgres: ## Ver logs de PostgreSQL
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl logs -f statefulset/postgres

k8s-restart: ## Reiniciar el deployment
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl rollout restart deployment/users-service && \
	kubectl rollout status deployment/users-service

k8s-scale: ## Escalar manualmente (usar: make k8s-scale REPLICAS=2)
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl scale deployment/users-service --replicas=$(REPLICAS)

k8s-exec: ## Ejecutar shell en un pod
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl exec -it deployment/users-service -- /bin/sh

k8s-port-forward: ## Port forward para acceso local (8000:8000)
	@export KUBECONFIG=$(KUBECONFIG_PATH) && \
	kubectl port-forward service/users-service 8000:80

# === CI/CD ===

ci-build: ## Build como lo hace CI
	docker buildx build --platform linux/amd64 -t $(IMAGE_NAME):$(IMAGE_TAG) .

ci-test: ## Simular el proceso de CI localmente
	@echo "🧪 Ejecutando tests de CI..."
	@echo "✅ Build test"
	@make docker-build
	@echo "✅ CI tests completados"

# === Utilidades ===

clean: ## Limpiar archivos temporales
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

format: ## Formatear código con black
	black app/ alembic/

lint: ## Ejecutar linter
	flake8 app/ alembic/ --max-line-length=100

.DEFAULT_GOAL := help
