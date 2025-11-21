# Script de Pruebas de Integración - API Gateway
# Ejecutar con: .\run-tests.ps1

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  🧪 PRUEBAS DE INTEGRACIÓN - API GATEWAY GRUPO 1" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://apigateway.grupo1.inf326.nursoft.dev"
$passed = 0
$failed = 0
$total = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200
    )
    
    $global:total++
    Write-Host "Test $global:total : $Name" -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -Method Get -ErrorAction Stop
        Write-Host " ✅ PASS" -ForegroundColor Green
        $global:passed++
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host " ✅ PASS (Expected $ExpectedStatus)" -ForegroundColor Green
            $global:passed++
        } else {
            Write-Host " ❌ FAIL (Got $statusCode)" -ForegroundColor Red
            $global:failed++
        }
        return $null
    }
}

# ========== HEALTH CHECKS ==========
Write-Host "📋 Health Checks" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint -Name "API Gateway Health" -Url "$BASE_URL/health"
Test-Endpoint -Name "Users Service Health" -Url "$BASE_URL/users/health"
Test-Endpoint -Name "Search Service Health" -Url "$BASE_URL/search/health"
Test-Endpoint -Name "Presence Service Health" -Url "$BASE_URL/presence/health"
Test-Endpoint -Name "Wikipedia Chatbot Health" -Url "$BASE_URL/chatbots/wikipedia/health"

Write-Host ""

# ========== DOCUMENTACIÓN ==========
Write-Host "📚 Documentación" -ForegroundColor Yellow
Write-Host ""

$openapi = Test-Endpoint -Name "OpenAPI Schema" -Url "$BASE_URL/openapi.json"
if ($openapi) {
    $pathCount = ($openapi.paths | Get-Member -MemberType NoteProperty).Count
    Write-Host "   → Endpoints documentados: $pathCount" -ForegroundColor Gray
}

Write-Host ""

# ========== AUTENTICACIÓN ==========
Write-Host "🔐 Autenticación" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint -Name "Protected Endpoint (No Token)" -Url "$BASE_URL/users/me" -ExpectedStatus 401

Write-Host ""

# ========== PRESENCIA ==========
Write-Host "👁️  Presencia" -ForegroundColor Yellow
Write-Host ""

$stats = Test-Endpoint -Name "Presence Stats" -Url "$BASE_URL/presence/stats"
if ($stats) {
    Write-Host "   → Total: $($stats.data.total) | Online: $($stats.data.online) | Offline: $($stats.data.offline)" -ForegroundColor Gray
}

Write-Host ""

# ========== BÚSQUEDA ==========
Write-Host "🔍 Búsqueda" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint -Name "Search Messages" -Url "$BASE_URL/search/messages?q=test"
Test-Endpoint -Name "Search Files" -Url "$BASE_URL/search/files?q=test"
Test-Endpoint -Name "Search Channels" -Url "$BASE_URL/search/channels?q=test"

Write-Host ""

# ========== ENDPOINTS REQUERIDOS AUTH ==========
Write-Host "🔒 Endpoints Protegidos (Esperan 401)" -ForegroundColor Yellow
Write-Host ""

Test-Endpoint -Name "Channels Health" -Url "$BASE_URL/channels/health" -ExpectedStatus 401
Test-Endpoint -Name "Files Health" -Url "$BASE_URL/files/health" -ExpectedStatus 401

Write-Host ""

# ========== RESUMEN ==========
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total de Pruebas:    $($global:total)" -ForegroundColor White
Write-Host "Exitosas:            $($global:passed) ✅" -ForegroundColor Green
Write-Host "Fallidas:            $($global:failed) ❌" -ForegroundColor Red
if ($global:total -gt 0) {
    Write-Host "Tasa de Éxito:       $([math]::Round(($global:passed/$global:total)*100, 2))%" -ForegroundColor $(if($global:failed -eq 0){"Green"}else{"Yellow"})
}
Write-Host ""

if ([int]$global:failed -eq 0) {
    Write-Host "🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE!" -ForegroundColor Green
} else {
    Write-Host "⚠️  ALGUNAS PRUEBAS FALLARON. Revisar logs arriba." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Retornar código de salida
if ($global:failed -gt 0) {
    exit 1
} else {
    exit 0
}
