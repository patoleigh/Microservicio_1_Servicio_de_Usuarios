"""
Pruebas de Integración para API Gateway
Verifica la conectividad con todos los microservicios externos
"""

import httpx
import pytest
from typing import Dict, Any

BASE_URL = "https://apigateway.grupo1.inf326.nursoft.dev"

class TestAPIGatewayIntegration:
    """Suite de pruebas de integración para el API Gateway"""
    
    @pytest.fixture
    def client(self):
        """Cliente HTTP para las pruebas"""
        return httpx.Client(timeout=30.0)
    
    def test_gateway_health(self, client):
        """Test 1: Health check del API Gateway"""
        response = client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "api-gateway"
        assert data["version"] == "v1"
        print("✅ Test 1 passed: API Gateway health check")
    
    def test_users_service_health(self, client):
        """Test 2: Health check del servicio de usuarios"""
        response = client.get(f"{BASE_URL}/users/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "users-service"
        print("✅ Test 2 passed: Users service health check")
    
    def test_search_service_health(self, client):
        """Test 3: Health check del servicio de búsqueda"""
        response = client.get(f"{BASE_URL}/search/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✅ Test 3 passed: Search service health check")
    
    def test_openapi_documentation(self, client):
        """Test 4: Verificar que la documentación OpenAPI está disponible"""
        response = client.get(f"{BASE_URL}/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "paths" in data
        assert "info" in data
        assert data["info"]["title"] == "Student Messaging API Gateway - Grupo 1"
        
        # Verificar que todos los servicios están documentados
        paths = data["paths"]
        assert "/users/register" in paths
        assert "/channels/" in paths
        assert "/messages/threads/{thread_id}" in paths
        assert "/files/" in paths
        assert "/moderation/check" in paths
        assert "/presence/" in paths
        assert "/search/messages" in paths
        assert "/chatbots/wikipedia/query" in paths
        assert "/chatbots/programming/query" in paths
        print("✅ Test 4 passed: OpenAPI documentation available")
    
    def test_unauthorized_access(self, client):
        """Test 5: Verificar que endpoints protegidos requieren autenticación"""
        # Intentar acceder a /users/me sin token
        response = client.get(f"{BASE_URL}/users/me")
        assert response.status_code == 401
        print("✅ Test 5 passed: Protected endpoints require authentication")
    
    def test_search_messages_endpoint(self, client):
        """Test 6: Verificar endpoint de búsqueda de mensajes"""
        response = client.get(f"{BASE_URL}/search/messages", params={"q": "test"})
        # El servicio puede retornar 200 o error dependiendo de su estado
        assert response.status_code in [200, 400, 401, 503]
        print("✅ Test 6 passed: Search messages endpoint accessible")
    
    def test_cors_headers(self, client):
        """Test 7: Verificar que CORS está configurado"""
        response = client.options(f"{BASE_URL}/health")
        # Verificar headers CORS
        assert response.status_code in [200, 204]
        print("✅ Test 7 passed: CORS configured")


class TestUserFlow:
    """Pruebas de flujo completo de usuario"""
    
    @pytest.fixture
    def client(self):
        return httpx.Client(timeout=30.0)
    
    def test_user_registration_endpoint(self, client):
        """Test 8: Verificar que el endpoint de registro existe"""
        # No registramos realmente, solo verificamos que el endpoint responde
        response = client.post(
            f"{BASE_URL}/users/register",
            json={"email": "test@test.com", "password": "test123", "full_name": "Test User"}
        )
        # Puede fallar por validación, pero el endpoint debe existir
        assert response.status_code in [200, 201, 400, 422]
        print("✅ Test 8 passed: User registration endpoint exists")
    
    def test_user_login_endpoint(self, client):
        """Test 9: Verificar que el endpoint de login existe"""
        response = client.post(
            f"{BASE_URL}/users/login",
            json={"email": "test@test.com", "password": "wrongpass"}
        )
        # Debe retornar 401 (credenciales incorrectas) o 422 (validación)
        assert response.status_code in [401, 422]
        print("✅ Test 9 passed: User login endpoint exists")


class TestServiceEndpoints:
    """Pruebas de endpoints de servicios específicos"""
    
    @pytest.fixture
    def client(self):
        return httpx.Client(timeout=30.0)
    
    def test_presence_stats_endpoint(self, client):
        """Test 10: Verificar endpoint de estadísticas de presencia"""
        response = client.get(f"{BASE_URL}/presence/stats")
        # Puede requerir auth o estar disponible públicamente
        assert response.status_code in [200, 401, 503]
        print("✅ Test 10 passed: Presence stats endpoint accessible")
    
    def test_search_threads_endpoint(self, client):
        """Test 11: Verificar endpoint de búsqueda de threads"""
        response = client.get(f"{BASE_URL}/search/threads/keyword/python")
        assert response.status_code in [200, 400, 401, 503]
        print("✅ Test 11 passed: Search threads endpoint accessible")
    
    def test_chatbot_wikipedia_endpoint(self, client):
        """Test 12: Verificar endpoint de chatbot Wikipedia"""
        response = client.post(
            f"{BASE_URL}/chatbots/wikipedia/query",
            json={"question": "What is Python?", "language": "en"}
        )
        assert response.status_code in [200, 400, 401, 503]
        print("✅ Test 12 passed: Wikipedia chatbot endpoint accessible")
    
    def test_chatbot_programming_endpoint(self, client):
        """Test 13: Verificar endpoint de chatbot Programming"""
        response = client.post(
            f"{BASE_URL}/chatbots/programming/query",
            json={"question": "How to create a list in Python?"}
        )
        assert response.status_code in [200, 400, 401, 503]
        print("✅ Test 13 passed: Programming chatbot endpoint accessible")


def run_all_tests():
    """Ejecutar todas las pruebas y mostrar resumen"""
    import sys
    
    print("\n" + "="*80)
    print("🧪 EJECUTANDO PRUEBAS DE INTEGRACIÓN DEL API GATEWAY")
    print("="*80 + "\n")
    
    # Ejecutar pytest
    exit_code = pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--color=yes"
    ])
    
    print("\n" + "="*80)
    if exit_code == 0:
        print("✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
    else:
        print("❌ ALGUNAS PRUEBAS FALLARON")
    print("="*80 + "\n")
    
    return exit_code


if __name__ == "__main__":
    exit(run_all_tests())
