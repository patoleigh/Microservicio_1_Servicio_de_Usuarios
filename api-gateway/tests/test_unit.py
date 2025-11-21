"""
Pruebas Unitarias para el API Gateway
Verifica la lógica interna sin conexiones externas
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import sys
import os

# Agregar el directorio padre al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import settings


class TestConfiguration:
    """Pruebas de configuración"""
    
    def test_settings_loaded(self):
        """Test 1: Verificar que las configuraciones se carguen correctamente"""
        assert settings.APP_NAME == "api-gateway"
        assert settings.APP_VERSION == "v1"
        assert settings.ENV == "production"
        print("✅ Test 1 passed: Settings loaded correctly")
    
    def test_service_urls_configured(self):
        """Test 2: Verificar que todas las URLs de servicios estén configuradas"""
        assert settings.USERS_SERVICE_URL
        assert settings.CHANNEL_SERVICE_URL
        assert settings.MESSAGES_SERVICE_URL
        assert settings.FILES_SERVICE_URL
        assert settings.MODERATION_SERVICE_URL
        assert settings.PRESENCE_SERVICE_URL
        assert settings.SEARCH_SERVICE_URL
        assert settings.WIKIPEDIA_SERVICE_URL
        assert settings.CHATBOT_PROG_SERVICE_URL
        print("✅ Test 2 passed: All service URLs configured")
    
    def test_jwt_configuration(self):
        """Test 3: Verificar configuración JWT"""
        assert settings.JWT_SECRET
        assert settings.JWT_ALG == "HS256"
        print("✅ Test 3 passed: JWT configuration valid")


class TestServiceClient:
    """Pruebas del cliente de servicios"""
    
    @pytest.mark.asyncio
    async def test_client_initialization(self):
        """Test 4: Verificar inicialización del cliente"""
        from app.clients.base import ServiceClient
        
        client = ServiceClient("https://test.example.com")
        assert client.base_url == "https://test.example.com"
        assert client.client is not None
        print("✅ Test 4 passed: Client initialization successful")
    
    @pytest.mark.asyncio
    async def test_client_request_method(self):
        """Test 5: Verificar método de petición del cliente"""
        from app.clients.base import ServiceClient
        
        client = ServiceClient("https://test.example.com")
        
        # Mock de la respuesta
        with patch.object(client.client, 'request', new_callable=AsyncMock) as mock_request:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"status": "ok"}
            mock_request.return_value = mock_response
            
            result = await client.get("/test")
            assert result == {"status": "ok"}
            print("✅ Test 5 passed: Client request method works")


class TestRouterImports:
    """Pruebas de importación de routers"""
    
    def test_users_router_import(self):
        """Test 6: Verificar importación del router de usuarios"""
        from app.routes import users
        assert users.router is not None
        print("✅ Test 6 passed: Users router imported")
    
    def test_channels_router_import(self):
        """Test 7: Verificar importación del router de canales"""
        from app.routes import channels
        assert channels.router is not None
        print("✅ Test 7 passed: Channels router imported")
    
    def test_messages_router_import(self):
        """Test 8: Verificar importación del router de mensajes"""
        from app.routes import messages
        assert messages.router is not None
        print("✅ Test 8 passed: Messages router imported")
    
    def test_files_router_import(self):
        """Test 9: Verificar importación del router de archivos"""
        from app.routes import files
        assert files.router is not None
        print("✅ Test 9 passed: Files router imported")
    
    def test_moderation_router_import(self):
        """Test 10: Verificar importación del router de moderación"""
        from app.routes import moderation
        assert moderation.router is not None
        print("✅ Test 10 passed: Moderation router imported")
    
    def test_presence_router_import(self):
        """Test 11: Verificar importación del router de presencia"""
        from app.routes import presence
        assert presence.router is not None
        print("✅ Test 11 passed: Presence router imported")
    
    def test_search_router_import(self):
        """Test 12: Verificar importación del router de búsqueda"""
        from app.routes import search
        assert search.router is not None
        print("✅ Test 12 passed: Search router imported")
    
    def test_chatbots_router_import(self):
        """Test 13: Verificar importación del router de chatbots"""
        from app.routes import chatbots
        assert chatbots.router is not None
        print("✅ Test 13 passed: Chatbots router imported")


class TestApplicationStructure:
    """Pruebas de estructura de la aplicación"""
    
    def test_main_app_import(self):
        """Test 14: Verificar importación de la aplicación principal"""
        from app.main import app
        assert app is not None
        assert hasattr(app, 'routes')
        print("✅ Test 14 passed: Main app imported")
    
    def test_app_metadata(self):
        """Test 15: Verificar metadata de la aplicación"""
        from app.main import app
        assert app.title == "Student Messaging API Gateway - Grupo 1"
        assert app.version == "v1"
        print("✅ Test 15 passed: App metadata correct")
    
    def test_cors_middleware(self):
        """Test 16: Verificar que CORS está configurado"""
        from app.main import app
        
        # Verificar que hay middleware configurado
        assert len(app.user_middleware) > 0
        print("✅ Test 16 passed: CORS middleware configured")


def run_all_tests():
    """Ejecutar todas las pruebas unitarias"""
    print("\n" + "="*80)
    print("🧪 EJECUTANDO PRUEBAS UNITARIAS DEL API GATEWAY")
    print("="*80 + "\n")
    
    exit_code = pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--color=yes"
    ])
    
    print("\n" + "="*80)
    if exit_code == 0:
        print("✅ TODAS LAS PRUEBAS UNITARIAS PASARON")
    else:
        print("❌ ALGUNAS PRUEBAS UNITARIAS FALLARON")
    print("="*80 + "\n")
    
    return exit_code


if __name__ == "__main__":
    exit(run_all_tests())
