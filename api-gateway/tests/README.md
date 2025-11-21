# Tests

Este directorio contiene las pruebas del API Gateway.

## Estructura

- `test_unit.py` - Pruebas unitarias (sin conexiones externas)
- `test_integration.py` - Pruebas de integración (con servicios reales)

## Ejecutar Pruebas

```bash
# Instalar dependencias de testing
pip install pytest pytest-asyncio httpx

# Ejecutar todas las pruebas
pytest tests/ -v

# Ejecutar solo pruebas unitarias
pytest tests/test_unit.py -v

# Ejecutar solo pruebas de integración
pytest tests/test_integration.py -v

# Con coverage
pip install pytest-cov
pytest tests/ --cov=app --cov-report=html
```

## Pruebas Unitarias

Las pruebas unitarias verifican:
- ✅ Configuración correcta
- ✅ Inicialización de clientes
- ✅ Importación de routers
- ✅ Estructura de la aplicación
- ✅ Middleware configurado

## Pruebas de Integración

Las pruebas de integración verifican:
- ✅ Health checks de todos los servicios
- ✅ Documentación OpenAPI
- ✅ Autenticación y autorización
- ✅ Endpoints de búsqueda
- ✅ Endpoints de chatbots
- ✅ Flujos de usuario completos
