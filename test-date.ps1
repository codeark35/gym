#Requires -Version 7

# Test script para verificar que la fecha del workout se guarda correctamente
# Ejecutar: .\test-date.ps1

$API_URL = "http://localhost:3022/api/v1"
$TOKEN = Read-Host -Prompt "Pega tu token JWT (desde localStorage del navegador, clave 'token')"

# Fecha local de hoy
$localDate = Get-Date -Format "yyyy-MM-dd"
$localTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"

Write-Host ""
Write-Host "=== Fecha local del sistema ===" -ForegroundColor Cyan
Write-Host "  Fecha:        $localDate"
Write-Host "  Hora completa: $localTime"
Write-Host ""

Write-Host "=== Creando workout con fecha: $localDate ===" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

$body = @{
    date = $localDate
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/workouts" -Method POST -Headers $headers -Body $body

    Write-Host "✅ Respuesta del servidor:" -ForegroundColor Green
    Write-Host "  workout.id:   $($response.data.id)"
    Write-Host "  workout.date: $($response.data.date)"
    Write-Host ""

    $dbDate = [DateTime]$response.data.date
    $dbDateStr = $dbDate.ToString("yyyy-MM-dd")

    Write-Host "=== Verificación ===" -ForegroundColor Cyan
    if ($dbDateStr -eq $localDate) {
        Write-Host "✅ CORRECTO: La fecha guardada coincide con la fecha local ($localDate)" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Fecha guardada ($dbDateStr) NO coincide con fecha local ($localDate)" -ForegroundColor Red
    }
    Write-Host ""

    # Verificar que findToday lo encuentre
    Write-Host "=== Buscando workout de hoy ===" -ForegroundColor Cyan
    $todayResponse = Invoke-RestMethod -Uri "$API_URL/workouts/today?date=$localDate" -Method GET -Headers $headers
    if ($todayResponse.data -and $todayResponse.data.id -eq $response.data.id) {
        Write-Host "✅ CORRECTO: findToday devuelve el mismo workout" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ADVERTENCIA: findToday no devuelve el workout recién creado" -ForegroundColor Yellow
    }
    Write-Host ""

    # Limpiar: eliminar el workout de prueba
    Write-Host "=== Limpiando workout de prueba ===" -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$API_URL/workouts/$($response.data.id)" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ Workout de prueba eliminado" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Detalles:" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message
}
